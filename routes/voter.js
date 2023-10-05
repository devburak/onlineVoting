const express = require('express');
const router = express.Router();
const Election = require('../db/models/election');  
const Voter = require('../db/models/voter');
const Member =require('../db/models/member');
const voterService = require("../services/voterService")
const  {authenticateJWT ,authenticateVoter,authenticateJWTOrVoter }  = require('../services/authMiddleware');  // JWT middleware'inizin konumuna göre ayarlanmalıdır.
const logService = require('../services/logService');

router.post('/new/:electionId', authenticateJWT, async (req, res) => {
    const userId = req.user.id;
    try {
        const { electionId } = req.params;
        const { memberIds } = req.body;
       

        // Seçim kontrolü
        const election = await Election.findById(electionId);
        if (!election) {
            return res.status(404).json({ message: 'Seçim Bulunamadı' });
        }

        const voters = [];
        const logDetails = [];
        for (const memberId of memberIds) {
            // Üyenin bu seçim için zaten voter olarak eklenip eklenmediğini kontrol et
            const existingVoter = await Voter.findOne({ member: memberId, election: electionId });
            if (existingVoter) {
                continue; // Bu üye zaten eklenmişse, döngüyü burada kes ve bir sonraki üyeye geç
            }
            
            // Benzersiz token oluştur
            // let token;
            // let tokenExists;
            // do {
            //     token = generateVoteToken();
            //     tokenExists = await Voter.findOne({ token });
            // } while(tokenExists);

            // Oylama üyelerini oluşturma
            voters.push({
                member: memberId,
                election: electionId,
                createdBy: userId,
                updatedBy: userId
            });
            logDetails.push(`Member ${memberId} - Seçmen oluşturuldu`);
        }

        // Oylama üyelerini veritabanına kaydetme
        await Voter.insertMany(voters);
        for(const detail of logDetails){
            await logService.logAction({
                action: 'CREATE',
                status: 'SUCCESS',
                userId:userId,  // İlgili kullanıcı ID'si
                details: detail  // Özel log detayı
            });
        }
        res.status(201).json({ message: 'Seçmen(ler) oluşturuldu' });

    } catch (error) {
        console.error('Error creating voters:', error);
        await logService.logAction({
            action: 'CREATE',
            status: 'FAILURE',
            userId:userId,  // İlgili kullanıcı ID'si
            details: "Bazı Seçmenler oluşturulamadı"  // Özel log detayı
        });
        res.status(500).json({ message: 'An error occurred' });
    }
});

router.get('/:electionId',authenticateJWTOrVoter, async (req, res) => {
    try {
        const { electionId } = req.params;

        // Sayfa numarası ve sayfa başına öğe sayısını al.
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 30;
        const hasVoted = req.query.hasVoted === 'true' ? true : req.query.hasVoted === 'false' ? false : undefined;
        const country = req.query.country;
        const city = req.query.city;
        const name = req.query.name;
        const surname = req.query.surname;
        
        // Diğer filtreleri parse etme...
        const filters = { hasVoted, country, city, name, surname };
        
        const voters = await voterService.getVoters(electionId, filters, { page, limit });

        res.json(voters);
    } catch (error) {
        console.error('Error fetching voters:', error);
        res.status(500).json({ message: 'An error occurred while fetching voters' });
    }
});




module.exports = router;