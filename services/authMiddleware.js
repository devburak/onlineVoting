exports.authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization;

    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
            if (err) {
                return res.status(403).send({ message: 'Invalid token' });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).send({ message: 'Unauthorized' });
    }
};
