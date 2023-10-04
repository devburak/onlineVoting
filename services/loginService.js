const jwt = require('jsonwebtoken');
const User = require('../db/models/user');
const fs = require('fs');
const path = require('path');
const { generateAndSaveResetCode } = require('./passwordCode'); 
const {sendEmail} = require('./mail');
const {formatDate } = require('../utils/date');

// Your secret key for signing JWTs
const SECRET_KEY = process.env.SECRET_KEY;

exports.signIn = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).send({ message: 'Invalid password' });
        }

        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '4h' });
        
        res.status(200).send({ token });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};


exports.createPasswordReset = async (email) => {
    // Dosya yolu
    const templatePath = path.join(__dirname, '../htmltemplates/reset_password_template.html');

    // E-posta şablonunu dosyadan okuma
    const resetPasswordEmailTemplate = fs.readFileSync(templatePath, 'utf-8');

    // Kullanıcıyı e-posta adresine göre bulma
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }

    // Şifre sıfırlama kodu oluşturma ve veritabanına kaydetme
    const resetCode = await generateAndSaveResetCode(user._id);
    const expireTime = process.env.PASSWORD_CODE_EXPIRE || 2;

    // E-posta içeriği oluşturma
    const resetLink = `${process.env.RESET_PASSWORD_LINK}/${resetCode}?email=${email}`;
    const emailContent = resetPasswordEmailTemplate
        .replace('{resetCode}', resetCode)
        .replace('{resetLink}', resetLink)
        .replace('{expire}', expireTime);

    // E-posta gönderme
    sendEmail(email, 'Parola Sıfırlama', emailContent);
};

exports.regeneratePassword = async (email, resetCode, newPassword) => {
    const templatePath = path.join(__dirname, '../htmltemplates/info_password_template.html');
    const resetPasswordEmailTemplate = fs.readFileSync(templatePath, 'utf-8');
    
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }
    
    const passwordReset = await PasswordReset.findOne({ userId: user._id, resetCode });
    if (!passwordReset || passwordReset.expiration < new Date()) {
        throw new Error('Invalid password reset code');
    }
    
    const isSamePassword = bcrypt.compareSync(newPassword, user.password);
    if (isSamePassword) {
        throw new Error('The new password cannot be the same as the old password');
    }
    
    user.password = newPassword;
    await user.save();
    
    passwordReset.resetTime = new Date();
    passwordReset.expiration = new Date();
    await passwordReset.save();

    const info_mail = process.env.INFO_MAIL || "";
    const emailContent = resetPasswordEmailTemplate.replace('{resetTime}', formatDate(passwordReset.resetTime))
        .replace('{infoEmail}', info_mail);

    await sendEmail(email, 'Password Reset Confirmation', emailContent);
};