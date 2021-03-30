const jsonWebToken = require('jsonwebtoken');
const errorResponse = require('../util/errorResponse');
const UserModel = require('../Models/user');

//@ desc  :-> this middleware is to be used to authenticate the user and then authorize for 
// other operation by adding the  user information to the request object

let authorize = async(req, res, next) => {

    // getting jwt token from the header -> authorization 
    // or we can get the token from the cookie....
    // verifying the token 
    // from token we get the user_id through which we get the user detail
    // then this user can able to update/delete the bootcamp + courses 

    let jwtToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        jwtToken = req.headers.authorization.split(' ')[1];
    }
    if (!jwtToken) {
        return next(new errorResponse('not authorize to acces this url or route', 401))
    }
    try {
        const decoded = jsonWebToken.verify(jwtToken, process.env.JWT_SECRET)
        req.user = await UserModel.findById(decoded.id)
        next();
    } catch (error) {
        console.log(`this error is occured due to changes in the jwt token${error}`)
        return next(new errorResponse('not authorize to acces this url or route', 401))

    }

}

module.exports = authorize;