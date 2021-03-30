const Router = require('express').Router();
const { register, forgetPassword, resetPassword, login, getCurrentLoginUser } = require('../controllers/auth');
const authorizationMiddleware = require('../Middlewares/auth');

Router.post('/register', register);
Router.post('/login', login)
Router.get('/me', authorizationMiddleware, getCurrentLoginUser);
module.exports = Router;