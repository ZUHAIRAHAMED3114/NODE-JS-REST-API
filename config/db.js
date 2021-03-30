const mongoose = require('mongoose');

const connectDB = async() => {
    var mongoDb = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true

    })

    console.log(`mongo db is connected ${mongoDb.connection.host}`.cyan.underline.bold)
}

module.exports = connectDB;