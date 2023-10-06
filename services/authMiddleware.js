const jwt = require('jsonwebtoken');
const User = require('../db/models/user'); 
const Voter =require('../db/models/voter')
// Your secret key for signing JWTs
const SECRET_KEY = process.env.SECRET_KEY;

const authenticateJWT = async (req, res, next) => {
  

    try {
        const token = req.headers.authorization?.split(' ')[1] ?? null;
        if(!token) return res.status(403).send({ message: 'No token provided' });
        const decoded = jwt.verify(token, SECRET_KEY);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).send({ message: 'Invalid token' });
        }

        req.user = user; // Kullanıcıyı request objesine atayarak bir sonraki middleware/route handler için kullanılabilir yapın
        next();
    } catch (err) {
        res.status(403).send({ message: 'Unauthorized' });
    }
};

const authenticateVoter = async (req, res, next) => {
    try {
        const voterToken = req.headers['voter-token'];
        
        if (!voterToken) {
            return res.status(401).json({ message: 'Voter token required' });
        }

        const voter = await Voter.findOne({ token: String(voterToken) });
        
        if (!voter) {
            return res.status(401).json({ message: 'Sadece oy kullananların yetkisi var' });
        }

        req.voter = voter;
        next();
    } catch (error) {
        console.error('Error in authenticateVoter middleware:', error);
        res.status(500).json({ message: 'An error occurred' });
    }
};


const authenticateJWTOrVoter = async (req, res, next) => {
    try {
        // JWT Kontrolü
        const token = req.headers.authorization?.split(' ')[1] ?? null;
        if (token) {
            const decoded = jwt.verify(token, SECRET_KEY);
            const user = await User.findById(decoded.userId);

            if (user) {
                req.user = user;
                return next();
            }
        }
        // Voter Kontrolü
        const voterToken = req.headers['voter-token'];
        if (voterToken) {
            const voter = await Voter.findOne({ token: String(voterToken) });
            if (voter) {
                req.voter = voter;
                return next();
            }
        }
        
        
        // Eğer hiçbir koşul sağlanmıyorsa, yetkisiz olarak kabul edilir
        return res.status(403).send({ message: 'Unauthorized' });
    } catch (error) {
        console.error('Error in authenticateJWTOrVoter middleware:', error);
        res.status(500).send({ message: 'An error occurred' });
    }
};



module.exports = {authenticateJWT,authenticateVoter,authenticateJWTOrVoter};
