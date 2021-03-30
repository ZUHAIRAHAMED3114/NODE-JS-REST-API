const mongoose = require('mongoose');
const bcryptJs = require('bcryptjs');
const jwtWebToken = require('jsonwebtoken');
const crypto = require('crypto');


let UserSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'please add a name']

    },
    email: {
        type: String,
        required: [true, 'please add email'],
        unique: true,
        match: [
            /^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,8})$/gm,
            'please add a valid email'
        ]
    },

    role: {
        type: String,
        enum: ['user', 'publisher'],
        default: 'user'
    },
    password: {
        type: String,
        required: [
            true, 'please add a password'
        ],
        minlength: 6,

    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpire: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

})

UserSchema.pre('save', function(next) {
    // this refers to the usermodel instance i.e is user document


    bcryptJs.genSalt(10)
        .then(salt => {

            bcryptJs.hash(this.password, salt)
                .then(hasedvalue => {
                    this.password = hasedvalue;
                    next();
                })


        })

    /*
         const salt=await bcryptJs.genSalt(10);
         this.pasword=await bcrypjs.hash(this.password,salt)

    */

})

// adding a instance method 

UserSchema.methods.getSignedJwtToken = function() {
    // this refers to the model instance ...

    // what we are putting in the payload..
    /*
         user._id

    */

    return jwtWebToken.sign({
        id: this._id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES
    })

}

UserSchema.methods.validatePassword = async function(normallpassword) {
    return await bcryptJs.compare(normallpassword, this.password);
}


//Generate and Hash the password
UserSchema.methods.getResetPasswordToken = function() {

    // Generate Token
    // we are giving 
    const resetToken = crypto.randomBytes(20)
        .toString('hex');
    // Hash Token
    this.resetPasswordToken = crypto.createHash('sha256')
        .update(resetToken)
        .digest('hex');
    // Set Expires
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
}

let UserModel = mongoose.model('UserModel', UserSchema);
module.exports = UserModel;