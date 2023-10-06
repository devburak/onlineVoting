const User = require('../db/models/user');
const logService = require('./logService');

exports.createUser = async (req, res) => {
    try {
        if (req.user && req.user.email !== process.env.MASTER_USER_MAIL) return res.status(403).send({ message: "You do not have permission to create a user." });
        const newUser = new User(req.body);
        const user = await newUser.save();
        await logService.logAction({
            action: 'CREATE',
            status: 'SUCCESS',
            userId: req.user?.id,
            details: 'User Oluşturuldu'
        });
        res.status(201).send(user);
    } catch (err) {
        await logService.logAction({
            action: 'CREATE',
            status: 'FAILURE',
            userId: req.user?.id,
            details: `User Oluşturma Hatası: ${err.message}`
        });
        res.status(500).send({ message: err.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }); // password field is excluded
        res.status(200).send(users);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const userIdFromToken = req.user.id;  // JWT'den gelen id
        if(!userIdFromToken) return res.status(403).send({ message: 'Kendini görebilirsin' });
        const user = await User.findById(userIdFromToken, { password: 0 });
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.status(200).send(user);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
      
        const userIdFromToken = req.user.id;  // JWT'den gelen id
        const userIdFromParams = req.params.id; // Parametre olarak gelen id
        const userEmailFromToken = req.user.email; // JWT'den gelen email
        // Kontrol
        if (userEmailFromToken !== process.env.MASTER_USER_MAIL && userIdFromToken !== userIdFromParams) {
            return res.status(403).send({ message: 'Unauthorized operation' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        
        user.set(req.body);  // `set` metodu ile değişiklikler ayarlanır.
        await user.save();  // `save` metodu ile değişiklikler kaydedilir.
        await logService.logAction({
            action: 'UPDATE',
            status: 'SUCCESS',
            userId: req.user?.id,
            details: 'User Güncellendi'
        });
        res.status(200).send(user);
    } catch (err) {
        await logService.logAction({
            action: 'CREATE',
            status: 'FAILURE',
            userId: req.user?.id,
            details: `User Güncelleme Hatası: ${err.message}`
        });
        res.status(500).send({ message: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        if (req.user && req.user.email !== process.env.MASTER_USER_MAIL) return res.status(403).send({ message: "You do not have permission to delete a user." });
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        await logService.logAction({
            action: 'DELETE',
            status: 'SUCCESS',
            userId: req.user?.id,
            details: 'User Silindi'
        });
        res.status(200).send({ message: 'User deleted successfully' });
    } catch (err) {
        await logService.logAction({
            action: 'CREATE',
            status: 'FAILURE',
            userId: req.user?.id,
            details: `User Silme Hatası: ${err.message}`
        });
        res.status(500).send({ message: err.message });
    }
};
