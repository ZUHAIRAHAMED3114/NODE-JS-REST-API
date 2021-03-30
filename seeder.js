const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');
const path = require('path')
    // this is for loading the environment varialbes
dotenv.config();

//loadinf the models
const BootCamp = require('./Models/bootcamp');
const Course = require('./Models/course');
const User = require('./Models/user');

mongoose.connect(process.env.MONGO_URI, {
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useNewUrlParser: true
});


const readDataFromJsonFile = function(path) {
    return JSON.parse(fs.readFileSync(path, 'utf-8'));

}

let bootcampPath = path.join(__dirname, 'data', 'bootcamps.json');
let coursePath = path.join(__dirname, 'data', 'courses.json')
let userPath = path.join(__dirname, 'data', 'user.json')
    // saving the data to the database
const saveTotheDataBase = async function() {
    try {

        await BootCamp.create(readDataFromJsonFile(bootcampPath));
        await Course.create(readDataFromJsonFile(coursePath));
        await User.create(readDataFromJsonFile(userPath));
        process.exit();
    } catch (error) {

        console.error(error)
    }

}


// delete the data from the database

const deleteData = async function() {
    try {
        await BootCamp.deleteMany();
        await Course.deleteMany();
        await User.deleteMany();
        console.log(` Deta Destroyed  `.red.inverse);
    } catch (error) {
        console.error(error)
    }
}

if (process.argv[2] === 'import') {
    saveTotheDataBase();
} else if (process.argv[2] === 'destroy') {
    deleteData();
}