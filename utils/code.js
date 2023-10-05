const shortid = require('shortid');

function generateVoteToken() {
    const voteToken = shortid.generate().substr(0, 8);
    return voteToken;
}

function generateRandomChars(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomChars = '';
    for (let i = 0; i < length; i++) {
        randomChars += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return randomChars;
}

module.exports = { generateVoteToken, generateRandomChars }