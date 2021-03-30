const userModel = require('../Models/user');
const errorResponse = require('../util/errorResponse');
const sendEmail = require('../util/sendemail');



let sendTokenResponse = async function(user, statusCode, res) {

    const token = user.getSignedJwtToken();
    const expires = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    if (process.env.NODE_ENV === 'production') {
        expires.secure = true;
    }
    res.status(statusCode)
        .cookie('token', token, expires)
        .json({
            success: true,
            token: token
        })

}

let authController = {


    //@desc     RegisterUser
    //@route    post /api/v1/auth/register
    //@access   Public
    register: function(req, res, next) {
        // getting the data from the req.body    
        const { name, email, password, role } = req.body;
        //creating a new user in the database
        userModel.create({
            name,
            email,
            password,
            role

        }).then(document => {

            sendTokenResponse(document, 201, res);
        })




    },

    //@desc   LoginUser 
    //@route  post/api/v1/auth/login
    //@access public
    login: async function(req, res, next) {
        // data comming from the user body as email,password
        // we have to check the validemail
        // if valid emain then check the password
        // if both email and password are matched then 
        // send jsonWebToken i.e is authenticated and this token is used for --> posting/updating/deleting bootcamps,courses

        const { email, password } = req.body;

        // checking the valid email

        if (!email || !password) {
            return next(new errorResponse('please submit valid email and password', 404))
        }

        let userDocument = await userModel.findOne({
            email: email
        });
        if (userDocument) {
            //validating the password
            //after validating the data  
            const ismatch = await userDocument.validatePassword(password);
            if (!ismatch) {
                return next(new errorResponse('Invalid Credentials', 401))
            }
            // here ismatch==true we are not yet returning any things
            await sendTokenResponse(userDocument, 200, res)


        } else {
            // there is not user 
            return next(new errorResponse('Invalid Credentials', 401))
        }

    },
    //@desc   get current logged in user
    //@route  Post/api/v1/auth/me
    //@access private
    getCurrentLoginUser: async(req, res, next) => {
        const user = await userModel.findById(req.user.id);
        res.status(200)
            .json({
                success: true,
                data: user

            })

    },

    //@desc   Forget Password
    //@route  Post/api/v1/auth/forgotpassword
    //@access public
    forgetPassword: async(req, res, next) => {
        const user = await userModel.findOne({ email: req.body.email });

        if (!user) {
            return next(new errorResponse('there is no user with the email', 404))
        }
        // this method will add data to resetPassword token and reset password expires in the encryptform
        // and returning the original reset Password Token instead the hash version...
        let resetToken = user.getResetPasswordToken();

        //create reset url

        const reseturl = `${req.protocol}://${req.get('host')}/api/v1/resetpassword/${resetToken}`;
        const message = `you are recieving this email becauses you(or someone else ) has requested the reset of a password. please
                        make a put request to :\n\n${reseturl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'password reset token',
                message
            })


            res.status(200)
                .json({
                    success: true,
                    data: 'Email sent successfully'
                })
        } catch (error) {
            console.log(error);

            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({
                validateBeforeSave: false
            })

            return next(new errorResponse('Email could not be sent', 500))
        }

        await user.save({
            validateBeforeSave: false
        });

    },

    resetPassword: (req, res, next) => {

    },

    logout: function(req, res, next) {

    },

    updateUserProfile: async(req, res, next) => {

    }


}

module.exports = authController;