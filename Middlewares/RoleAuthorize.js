const jsonWebToken = require('jsonwebtoken');
const errorResponse = require('../util/errorResponse');
const UserModel = require('../Models/user');


let roleBasedAuthorized = (...roles) => {


    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new errorResponse(`User role ${req.user.role} is not authorized to access the route`, 403))

        }

        next();
    }
}

module.exports = roleBasedAuthorized;