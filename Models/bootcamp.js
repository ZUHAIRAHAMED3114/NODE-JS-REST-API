const { request } = require('express');
const mongoose = require('mongoose');
const slugify = require('slugify');
const geoCoder = require('../util/geoCode');


const bootCampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please add a name'],
        unique: true,
        trim: true,
        maxLength: [50, 'name cannot be more than 50 characters']
    },
    slug: {
        type: String
    },
    address: String,
    description: {
        type: String,
        required: [true, 'please add a description'],
        maxlength: [500, 'Description cannot be more than 500 characaters']

    },
    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-z0-9@:%._\+~#=]{1,256}\.[a-zA-z0-9()]{1,6}\b([-a-zA-z0-9@:%_\+.?~&=]*)/, 'please use a valid URL with http or https'

        ]
    },
    phone: {
        type: String,
        maxLength: [20, 'phone number cannot be longer then 20 characters']
    },
    email: {
        type: String,
        match: [
            /^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,8})$/gm,
            'please add a valid email'
        ]
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],

        },
        coordinates: {
            type: [Number],

            index: '2dsphere'

        },
        formattedAddress: String,
        street: String,
        city: String,
        State: String,
        zipcode: String,
        country: String


    },

    careers: {
        type: [String],
        required: true,
        enum: [

            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other'
        ]
    },
    averageRating: {
        type: Number,
        min: [1,
            'Rating must be at least 1'
        ],
        max: [10,
            'Rating must ca not be more than 10'
        ]
    },
    averageCost: Number,
    photo: {
        type: String,
        default: 'no-photo.jpg'

    },
    housing: {
        type: Boolean,
        default: true
    },
    jobAssistance: {
        type: Boolean,
        default: true
    },
    jobGuarantee: {
        type: Boolean,
        default: false
    },
    acceptGi: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel',
        required: true
    }

});

bootCampSchema.pre('save', async function(next) {

    const dataFromGoogleMap = await geoCoder.geocode(this.address);

    this.location = {
        type: 'Point',
        coordinates: [
            dataFromGoogleMap[0].longitude,
            dataFromGoogleMap[0].latitude
        ],
        formattedAddress: dataFromGoogleMap[0].formattedAddress,
        street: dataFromGoogleMap[0].streetName,
        city: dataFromGoogleMap[0].city,
        State: dataFromGoogleMap[0].stateCode,

        zipcode: dataFromGoogleMap[0].zipcode,
        country: dataFromGoogleMap[0].country

    }

    this.slug = slugify(this.name, {
        lower: true,

    })
    this.address = undefined;


    next();
})

module.exports = mongoose.model('Bootcamp', bootCampSchema);