const Member = require('../db/models/member');
const maskPhone = require('../utils/maskPhone'); 

exports.createMember = async (req, res) => {
    try {
        const member = new Member(req.body);
        await member.save();
        res.status(201).send(member);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
};


exports.getMembers = async (req, res) => {
    try {
        const { page = 1, limit = 20, ...query } = req.query;
        const members = await Member.paginate(query, { page, limit });
        // Mask phone numbers
        members.docs = members.docs.map(member => ({
            ...member._doc,
            phone: maskPhone(member.phone)
        }));

        res.status(200).send(members);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.getMemberById = async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        if (!member) {
            return res.status(404).send({ message: 'Member not found' });
        }
         // Mask the phone number
         const maskedMember = {
            ...member._doc,
            phone: maskPhone(member.phone)
        };
        res.status(200).send(maskedMember);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.updateMember = async (req, res) => {
    try {
        const member = await Member.updateOne({ _id: req.params.id }, req.body, { new: true });
        if (!member) {
            return res.status(404).send({ message: 'Member not found' });
        }
        res.status(200).send(member);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
};

exports.deleteMember = async (req, res) => {
    try {
        const member = await Member.findByIdAndDelete(req.params.id);
        if (!member) {
            return res.status(404).send({ message: 'Member not found' });
        }
        res.status(204).send(member);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

