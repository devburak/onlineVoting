const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const voteSchema = new mongoose.Schema({
  election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election' },
  choice: String,  // Oy tercihi (A, B, C, etc.)
  choiceValue: Number, // Tercihe ait değer (1, 2, 3, etc.)
  envelope: {
    fingerprint: String,  // Cihaz fingerprint
    userAgent: String,    // Kullanıcı tarayıcı bilgisi
    responseTime: Number, // API yanıt süresi (ms cinsinden)
    ip: String,           // Kullanıcının IP adresi
    votingTime: Date,     // Oy kullanma zamanı
  }
});
voteSchema.plugin(mongoosePaginate);
const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
