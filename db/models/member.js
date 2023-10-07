const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const memberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, unique: true, required:true },
    email: {
        type: String,
        unique: true,
        sparse: true
    }
},{ timestamps: { createdAt: 'created', updatedAt: 'updated' } });
// Save işleminden önce çalışacak olan middleware
memberSchema.pre('save', function (next) {
    this.updated = new Date();
    next();
});

// Update işleminden önce çalışacak olan middleware
memberSchema.pre('updateOne', function (next) {
    this.set({ updated: new Date() });
    next();
});
memberSchema.plugin(mongoosePaginate);
const Member = mongoose.model('Member', memberSchema);

module.exports = Member;
