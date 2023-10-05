const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const logSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: ['CREATE', 'UPDATE', 'DELETE', 'VOTE']
    },
    status: {
        type: String,
        required: true,
        enum: ['SUCCESS', 'FAILURE']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false  // Eğer işlem bir kullanıcı tarafından yapılmıyorsa bu alanı isteğe bağlı yapabilirsiniz.
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    details: {
        type: String,
        required: false  // Ekstra detayları burada saklayabilirsiniz
    }
});
logSchema.plugin(mongoosePaginate);
const Log = mongoose.model('Log', logSchema);

module.exports = Log;
