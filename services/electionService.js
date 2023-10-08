// service/electionService.js
const { ObjectId } = require('mongoose').Types;
const Election = require('../db/models/election');
const Voter = require('../db/models/voter');
const Vote = require('../db/models/vote');
const logService = require('./logService');

exports.createElection = async (req, res) => {
    try {
        const election = new Election(req.body);
        await election.save();
        await logService.logAction({action:'CREATE', status:'SUCCESS', userId: req.user?.id, details:'Election created successfully'});
        res.status(201).send(election);
    } catch (error) {
        await logService.logAction({action:'CREATE', status:'FAILURE', userId: req.user?.id, details: `Election creation failed: ${error.message}`});
        res.status(500).send(error);
    }
};

exports.getElections = async (req, res) => {
    try {
        const elections = await Election.find({});
        res.status(200).send(elections);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getElectionById = async (req, res) => {
    try {
        const election = await Election.findById(req.params.id);
        if (!election) {
            return res.status(404).send();
        }
    
        const now = new Date();  // Şu anki zamanı al
    
        // Yeni özellik ekleyerek ve şartı kontrol ederek belirle
        election._doc.voteCanShow = election.endTime < now && election.isActive;
        
        res.send(election);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.updateElection = async (req, res) => {
    try {
        const election = await Election.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!election) {
            return res.status(404).send();
        }
        await logService.logAction({action: 'UPDATE', status:'SUCCESS', userId: req.user?.id, details: req.params?.id+' Seçim Güncellendi'});
        res.send(election);
    } catch (error) {
        await logService.logAction({action: 'UPDATE', status: 'FAILURE', userId: req.user?.id, details: `${req.params?.id} Seçim güncelleme hatası: ${error.message}`});
        res.status(500).send(error);
    }
};

exports.deleteElection = async (req, res) => {
    try {
        if (req.user?.email !== process.env.MASTER_USER_MAIL) {
            return res.status(403).send({ message: 'Unauthorized operation' });
        }
        const election = await Election.findByIdAndDelete(req.params.id);
        if (!election) {
            return res.status(404).send();
        }
        await logService.logAction({action:'DELETE', status:'SUCCESS', userId: req.user?.id, details: req.params?.id+' Seçim Silindi'});
        res.send(election);
    } catch (error) {
        await logService.logAction({action:'DELETE', status:'FAILURE', userId: req.user?.id, details: req.params?.id+' Seçim Silinemedi'});
        res.status(500).send(error);
    }
};

exports.getSummary = async (req, res) => {
    try {
        const { electionId } = req.params;
        console.log(electionId)
        // Seçimin varlığını ve aktifliğini kontrol et
        // const election = await Election.findOne({
        //     _id: new ObjectId(electionId),
        //     isActive: true,
        //     startTime: { $lt: new Date() },
        //     endTime: { $gt: new Date() }
        // });

        // if (!election) {
        //     return res.status(400).json({ message: 'Election not active or not found' });
        // }

        // Toplam oy kullanıcısı ve kullanılan oy sayısını bul
        const [totalVoters, totalVotes, votedVoters, notVotedVoters] = await Promise.all([
            Voter.countDocuments({ election: electionId }),
            Vote.countDocuments({ election: electionId }),
            Voter.countDocuments({ election: electionId, hasVoted: true }),
            Voter.countDocuments({ election: electionId, hasVoted: false })
        ]);

        // Her bir seçenek için oy sayısını bul
        const choicesCount = await Vote.aggregate([
            { $match: { election: new ObjectId(electionId) } },
            { $group: { _id: '$choice', count: { $sum: 1 }, value: { $first: "$choiceValue" } } }
        ]);

        res.status(200).json({
            totalVotes,
            totalVoters,
            votedVoters, 
            notVotedVoters,
            choicesCount
        });
    } catch (error) {
        console.error('Error fetching election summary:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}