const Member = require('../db/models/member');
const maskPhone = require('../utils/maskPhone'); 
const logService = require('./logService');

exports.createMember = async (req, res) => {
    try {
        const member = new Member(req.body);
        await member.save();
        // Başarılı işlem logu kaydet
        await logService.logAction({
            action: 'CREATE',
            status: 'SUCCESS',
            userId: req.user?.id,
            details: 'Üye Oluşturuldu'
        });

        res.status(201).send(member);
    } catch (err) {
        // Başarısız işlem logu kaydet
        await logService.logAction({
            action: 'CREATE',
            status: 'FAILURE',
            userId: req.user?.id,
            details: `Üye Oluşturma Hatası: ${err.message}`
        });
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
        await logService.logAction({
            action: 'UPDATE',
            status: 'SUCCESS',
            userId: req.user?.id,
            details: req.params.id + ' Üye güncellendi'
        });
        res.status(200).send(member);
    } catch (err) {
         // Başarısız işlem logu kaydet
         await logService.logAction({
            action: 'UPDATE',
            status: 'FAILURE',
            userId: req.user?.id,
            details: `${req.params?.id },Üye Güncelleme Hatası: ${err.message}`
        });
        res.status(400).send({ message: err.message });
    }
};

exports.deleteMember = async (req, res) => {
    try {
        const member = await Member.findByIdAndDelete(req.params.id);
        if (!member) {
            return res.status(404).send({ message: 'Member not found' });
        }
        await logService.logAction({
            action: 'DELETE',
            status: 'SUCCESS',
            userId: req.user?.id,
            details: req.params.id + ' Üye Silindi'
        });
        res.status(204).send(member);
    } catch (err) {
        await logService.logAction({
            action: 'UPDATE',
            status: 'FAILURE',
            userId: req.user?.id,
            details: `${req.params?.id },Üye Silinme Hatası: ${err.message}`
        });

        res.status(500).send({ message: err.message });
    }
};

