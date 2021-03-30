require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const colors = require('colors');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');

//Routes Files 

const bootcampRoute = require('./Routes/bootcamp');
const courseRoute = require('./Routes/courses');
const reviewRoute = require('./Routes/reviews');
const userRoute = require('./Routes/users');
const authRoute = require('./Routes/auth');
const morgan = require('morgan');
const errorHandler = require('./Middlewares/error');
//creating an application
const app = express();
const port = process.env.PORT || 5000;
//connecting to the database
connectDB();

// MiddleWare 

//cookie parsre
app.use(cookieParser());

//body parser :-> 
app.use(express.urlencoded());
app.use(express.json());

// for static file 
app.use(express.static('public'));

//Development logging middleware 
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}
// file uploading middleware
app.use(fileUpload());


// using the middleware for the routes
app.use('/api/v1/bootcamps', bootcampRoute);

app.use('/api/v1/courses', courseRoute);
app.use('/api/v1/reviews', reviewRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/users', userRoute);
// note :--> it is important to use the particulare middleware after the 
// route handler....
app.use(errorHandler)


var server = app.listen(port, () => {
    console.log(`server running in ${process.env.NODE_ENV} node on port ${port}`.yellow.bold)
})

// Handling the unhandling promoise Rejection where at the total application
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error ${err.message}`)
        // due to error occured. we will closing the server
    console.log('closing the server'.red)
    server.listen(() => {
        promise.exit()
    })

})