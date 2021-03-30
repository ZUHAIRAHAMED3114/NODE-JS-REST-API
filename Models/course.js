const mongoose = require('mongoose');
const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'please add a course title']

    },
    description: {
        type: String,
        required: [true, 'please add a description']
    },
    weeks: {
        type: String,
        required: [true, 'please add a number of weeks']

    },
    tuition: {
        type: Number,
        required: [true, 'please add a tuition cost']
    },
    minimumSkill: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: [true, 'please add a minimum skill']
    },
    scholarshipsAvailable: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bootcamp',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel',
        required: true
    }
})


// for course schema adding the course cost after saves.. as well as before removing..

courseSchema.statics.getAverageCost = async function(bootcampId) {
    const obj = await this.aggregate([{
            $match: {
                bootcamp: bootcampId
            }
        },
        {
            $group: {
                _id: '$bootcamp',
                averageCost: {
                    $avg: '$tuition'
                }
            }
        }

    ])


    // this  the colleciton of document where each document containn the feild which are defined by the group Stage + id

    console.log('updating the database');

    var CaclulatedAverageCost = await obj;
    // console.log(CaclulatedAverageCost);
    this.model('Bootcamp')
        .findByIdAndUpdate(this.bootcamp, {
            averageCost: Math.ceil(CaclulatedAverageCost[0].averageCost / 10) * 10
        })
        .then(success => {
            console.log(' avg cost is succesfully updated to the data base')
        })

}

courseSchema.post('save', function() {

    this.constructor.getAverageCost(this.bootcamp);
})

courseSchema.pre('remove', function() {
    this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model('Courses', courseSchema);