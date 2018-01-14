const mongoose =  require('mongoose');
const bcrypt = require('bcrypt');

const { Schema } = mongoose;

var UserSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
    },
    fullname: {
        type: String,
        required: true,
    },
}, {timestamps: true});

UserSchema.pre('save', function(next, done){
    var user = this;
    bcrypt.hash(user.password, 10, function(err, hash){
        console.log('done');
        if(err){
            console.log('err');
            return(next(err));
        }
        user.password = hash;
        next();
    });
});

UserSchema.statics.authenticate = function(email, password, callback){
    User.findOne({email: email}).exec(function(err, user){
        if(err){
            return callback(err);
        }
        else if(!user){
            var err = new Error('Login invalid.');
            err.status = 401;
            return callback(err);
        }
        bcrypt.compare(password, user.password, function(err, result){
            if(result==true){
                return callback(null, user);
            }
            else {
                var err = new Error('Login invalid.');
                err.status = 401;
                return callback(err);
            }
        });
    })
}

const User = mongoose.model('User', UserSchema);