const Voter = require('../db/models/voter');
const Member = require('../db/models/member');
const Election = require('../db/models/election');
const Vote = require('../db/models/vote');
const {sendSMSTR,sendSMST} =require('./sms')
const {sendEmail} = require('./mail')
const fs = require('fs');
const path = require('path');
const logService = require('./logService');

const {generateVoteToken} = require('../utils/code')

exports.voteRequestService = async (identifier, electionId) => {
    try {
        
         //  Seçim kontrolü
         const election = await Election.findById(electionId);
         const currentDate = new Date();
         if (!election || !election.isActive || election.endTime <= currentDate) {
             throw new Error('Seçim Aktif Değil');
         }


        const member = await Member.findOne({
            $or: [
                { email: identifier },
                { phone: identifier }
            ]
        }).exec();
        
        if (!member) {
            throw new  Error('Seçmen Kaydı bulunamadı');
        }
        
        const voter = await Voter.findOne({
            member: member._id,
            hasVoted: false
        }).exec();
        
        if (!voter ) {
            throw new Error('Seçmen Oy kullanmış veya kaydı henüz yapılmamış');
        }

        // Token oluşturma
        const token = await createVotingToken(voter.id, electionId);

        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;

        const votingCode = token || "--"
        const votingLink = process.env.VOTING_LINK || "#"
        const contactEmail = process.env.CONTACT_EMAIL || "@"

        if (emailRegex.test(identifier)) {
           
            // Dosya yolu
            const templatePath = path.join(__dirname, '../htmltemplates/vote_code_template.html');

            // E-posta şablonunu dosyadan okuma
            const voteCodeTemplate = fs.readFileSync(templatePath, 'utf-8');
            //sms ve mail
            const emailContent = voteCodeTemplate
            .replace(/{YOUR_VOTING_CODE}/g, votingCode)
            .replace(/{VOTING_LINK}/g,  votingLink+'?code='+votingCode)
            .replace(/{CONTACT_EMAIL}/g, contactEmail);

            // E-posta gönderme
            sendEmail(identifier, 'Oy Kodunuz', emailContent);
            await logService.logAction({action:'TOKEN',  status:'SUCCESS', details: "email üzerinden token gönderildi"});
        }else {
            // Identifier, e-posta formatında değil, bu durumda SMS gönder
            const smsContent = `Oy kullanma kodunuz: ${votingCode}  Kod kullanım süresi 20 dk ile sınırlıdır. ${votingLink}/?code=${votingCode} adresine gidebilirsiniz.`;
            if (member.phone && member.phone.startsWith("90"))
                await sendSMSTR(member.phone, smsContent);
            else
                await sendSMST(member.phone, smsContent);

            await logService.logAction( {action: 'TOKEN',  status: 'SUCCESS', details: member.phone +" sms üzerinden token gönderildi"});
        }

        return { message: 'Voting token sent to the voter' };
        
    } catch (error) {
        console.error('Error in voteRequestService:', error);
        await logService.logAction({action:'TOKEN', status:'FAILURE', details: "token gönderilemedi"});
        throw error;
    }
};

const createVotingToken = async (voterId) => {
    try {
        // 1. Kısıtlama: Voter'ın oy kullanmamış olması gerekiyor
        const voter = await Voter.findById(voterId);
        if (!voter || voter.hasVoted) {
            throw new Error('Seçmen Oy Kullanmış ya da Kaydı yapılmamış');
        }

        // // 2. Kısıtlama: Seçim sona ermemiş olmalı
        // const election = await Election.findById(electionId);
        // const currentDate = new Date();
        // if (!election || !election.isActive || election.endDate <= currentDate) {
        //     throw new Error('Seçim Bitmiş oy kullanılamaz');
        // }

        // Benzersiz token oluştur
        let token;
        let tokenExists;
        do {
            token = generateVoteToken();
            tokenExists = await Voter.findOne({ token });
        } while(tokenExists);

        // 3. Kısıtlama: Token'ın geçerlilik süresi 15 dakika olmalı (veya ihtiyaca göre 20 dk vs.)
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + 15); 

        // Token ve geçerlilik süresini veritabanına kaydet
        voter.token = token;
        voter.tokenExpiry = expiryDate;
        await voter.save();
        return token;
    } catch (error) {
        console.error('Error creating voting token:', error);
        throw error;
    }
}

exports.castVote = async (req, res) => {
    try {
        const { voterToken, electionId, choice, choiceValue, clientEnvelope } = req.body;

        // Kontroller
        const voter = await Voter.findOne({
            token: voterToken,
            hasVoted: false,
            tokenExpiry: { $gt: new Date() }
        });

        if (!voter) {
            throw new Error('Kod geçersiz');
        }

        const election = await Election.findById(electionId);
        const currentDate = new Date();
        if (!election || !election.isActive ) {
            throw new Error('Aktif Seçim yok');
        }

        if( election.endTime <= currentDate || election.startTime > currentDate ){
            throw new Error('Seçim Henüz Başlamadı veya Seçim Sonlandı');
        }

        // Response time hesaplaması için başlangıç zamanı
        const startTime = Date.now();

        const serverEnvelope = {
            // ip: req.ip || req.connection.remoteAddress,  // IP adresini al
            ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            votingTime: new Date(),  // Oy kullanma zamanını kaydet
            userAgent: req.headers['user-agent']  // Kullanıcı agent bilgisini al
        };

        const envelope = { 
            ...clientEnvelope, 
            ...serverEnvelope, 
            responseTime: undefined  // Bu değeri daha sonra set edeceğiz
        };

        // Oy oluşturma
        const newVote = new Vote({
            election: electionId,
            choice,
            choiceValue,
            envelope
        });

        const savedVote = await newVote.save();

        // Voter durumunu güncelleme
        voter.hasVoted = true;
        await voter.save();

        // Response time hesaplaması için bitiş zamanı ve süre hesaplama
        const endTime = Date.now();
        savedVote.envelope.responseTime = endTime - startTime;
        await savedVote.save();
        await logService.logAction({action:'VOTE', status:'SUCCESS',  details:"Oy Kullanıldı : " +savedVote._id});
        res.status(200).json({ 
            message: 'Oy başarılı şekilde kullanıldı',
            voteId: savedVote._id
        });
    } catch (error) {
        console.error('Error in castVote:', error);
        await logService.logAction({action:'VOTE',status: 'FAILURE', details: "Oy Kullanılamadı"});
        res.status(500).json({
            message: 'An error occurred while casting the vote.' +error.message,
           
        });
    }
};

exports.getVoteById = async (req, res) => {
    try {
        const voteId = req.params.id; // Parametre olarak gelen ID
        // Veritabanından Vote bilgisini al ve election ile populate et
        const vote = await Vote.findById(voteId).populate('election').exec(); 
        // Eğer vote bulunamazsa, 404 ve hata mesajı gönder
        if (!vote) {
            return res.status(404).json({ message: 'Vote not found' });
        }
        // Vote bilgisini response olarak gönder
        res.status(200).json(vote);
    } catch (error) {
        // Hata durumunda 500 status kodu ve hata bilgisi gönder
        console.error('Get Vote Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getVotes = async (req, res) => {
    try {
        const { electionId } = req.params;
        const { page = 1, limit = 30 } = req.query; // Varsayılan olarak sayfa 1 ve limit 30.

        // Seçimi kontrol et
        const election = await Election.findById(electionId);
        if (!election) {
            return res.status(404).json({ message: 'Seçim bulunamadı' });
        }

        const currentDate = new Date();
        if (!election.isActive || election.startTime > currentDate ) {
            return res.status(403).json({ message: 'Seçim henüz başlamadı veya Aktif değil' });
        }

        // Vote'ları getir
        const votes = await Vote.paginate(
            { election: electionId },
            { page, limit, sort: { 'envelope.votingTime': 'desc' } }
        );

        res.status(200).json(votes);
    } catch (error) {
        console.error('Error in getVotes:', error);
        res.status(500).json({
            message: 'Vote’ları getirirken bir hata oluştu.',
        });
    }
};
