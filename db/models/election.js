const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    options: [
        {
            text: {
                type: String,
                required: true,
                trim: true
            },
            value: {
                type: String,
                required: true
            }
            // İsterseniz her seçenek için ek bilgiler ekleyebilirsiniz.
        }
    ],
    electionType: {
        type: String,
        enum: ['single', 'multiple'],
        required: true
    },
    electionDate: {
        type: Date,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    }
});

const Election = mongoose.model('Election', electionSchema);

module.exports = Election;
