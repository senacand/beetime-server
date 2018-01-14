var mongoose = require('mongoose');
const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator(256);

var Schema = mongoose.Schema;

var SessionSchema = new Schema({
    _id: {
        type: String,
        unique: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
        index: true,
    },
});

SessionSchema.pre('save', function(next, done){
    var session = this;
    uidgen.generate(function(err, uid){
        if(err) return next(err);
        session._id = uid;
        next();
    });
});

const Session = mongoose.model('Session', SessionSchema);