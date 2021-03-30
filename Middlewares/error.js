const errorResponse = require('../util/errorResponse');

const errorHandler = (err, req, res, next) => {
    let error = {...err }
        // i doesn't understand why err.message is not copied to the error object
    var message = req.path.split('/')[3];
    console.log(message);
    error.message = err.message;
    if (err.name === 'CastError') {
        error = new errorResponse(message + ' will not found with id of ' + error.value, 400)
    }
    if (err.name === 'MongoError' && err.code === 11000) {
        error = new errorResponse(err.message, 400)
    }
    if (err.name === 'ValidationError') {
        // console.log(Object.keys(err))
        // console.log(Object.keys(err.errors))
        // console.log(Object.values(err.errors))
        // console.log(err._message)

        //  console.log(Object.keys())

        var msg = Object.values(err.errors).map(err => err.properties.message);
        error.message = msg;
    }

    res.status(error.statusCode || 500)
        .json({
            success: 'false',
            error: error.message || 'In the Server Error'
        });
}

module.exports = errorHandler;