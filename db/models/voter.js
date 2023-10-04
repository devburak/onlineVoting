const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const voterSchema = new Schema({
    member: { type: Schema.Types.ObjectId, ref: 'Member' },
    election: { type: Schema.Types.ObjectId, ref: 'Election' },
    token: { type: String, required: true, unique: true },
    tokenExpiry: { type: Date, required: true },
    hasVoted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }, // User modelinizi referans alın
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // User modelinizi referans alın
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
});
voterSchema.plugin(mongoosePaginate);
// Güncelleme tarihini otomatik olarak set eden bir middleware
voterSchema.pre('save', function(next) {
    if (this.isModified()) {
        this.updated = Date.now();
    }
    next();
});

const Voter = mongoose.model('Voter', voterSchema);

module.exports = Voter;
