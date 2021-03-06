const mongoose =  require('mongoose');

const { Schema } = mongoose;

var SurveyAnswerSchema = new Schema({
    nim: {
        type: String,
        required: true,
    },
    name: {
        type: String,
    },
    program: {
        type: String,
    },
    schedule: [[{
        type: Number,
    }]],
}, {timestamps: true})

var SurveySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    answers: [SurveyAnswerSchema],
}, {timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});

const Survey = mongoose.model('Survey', SurveySchema);