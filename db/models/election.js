const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    name: {
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
                type: Number,
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
    },
    isActive:{
        type : Boolean ,
        required:true,
        default:true
    }
});

const Election = mongoose.model('Election', electionSchema);

module.exports = Election;
