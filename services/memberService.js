const Member = require('../db/models/member');
const Voter = require('../db/models/voter')
const maskPhone = require('../utils/maskPhone'); 
const logService = require('./logService');
const mongoose = require('mongoose');
const cleanObj =require('../utils/cleaner')
exports.createMember = async (req, res) => {
    try {
        
        const cleanedMemberData = cleanObj(req.body);
        const member = new Member(cleanedMemberData);
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
        let { page = 1, limit = 20, ...query } = req.query;
        // Sayıya dönüştürme işlemi
        page = parseInt(page);
        limit = parseInt(limit);
        if (isNaN(page) || isNaN(limit)) {
            return res.status(400).send({ message: "Invalid page or limit value" });
        }

        const options = {
            page,
            limit,
            sort: { updated: -1 }, // <- Sıralama burada tanımlanır
        };
        const members = await Member.paginate(query, options);
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
        const cleanedMemberData = cleanObj(req.body);
        const member = await Member.updateOne({ _id: req.params.id }, cleanedMemberData, { new: true });
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


exports.nonVoterMembers = async (req, res) => {
    try {
        const { page = 1, limit = 20, electionId } = req.query;
        
        if (!mongoose.isValidObjectId(electionId)) {
            return res.status(400).send({ message: 'Invalid electionId' });
        }

        // Seçim için Voter'ları çek
        const voters = await Voter.find({ election: electionId }).select('member -_id');
        
        // Voter olarak atanmış üye ID'lerini al
        const voterMemberIds = voters.map(voter => voter.member);
        
        
        // Sorgu parametrelerini ayarla
        const query = {
            _id: { $nin: voterMemberIds }
        };
        
        // Pagination ve sorting opsiyonlarını ayarla
        const options = {
            page,
            limit,
            sort: { updated: -1 } // Güncelleme tarihine göre tersten sırala
        };

        // Voter olarak atanmamış üyeleri çek
        const members = await Member.paginate(query, options);

        res.status(200).send(members);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
