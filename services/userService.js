const User = require('../db/models/user');

exports.createUser = async (req, res) => {
    try {
        const newUser = new User(req.body);
        const user = await newUser.save();
        res.status(201).send(user);
    } catch (err) {
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
        const user = await User.findById(req.params.id, { password: 0 });
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
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!updatedUser) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.status(200).send(updatedUser);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.status(200).send({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
