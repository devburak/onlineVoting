const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: String,
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
});

// Password hashleme
userSchema.pre('save', async function(next) {
    try {
        if (this.isModified('password') || this.isNew) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Güncelleme tarihini otomatik olarak set eden bir middleware
userSchema.pre('save', function(next) {
    if (this.isModified()) {
        this.updated = Date.now();
    }
    next();
});

userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
}


userSchema.methods.comparePassword = async function (password) { 
    return  bcrypt.compareSync(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
