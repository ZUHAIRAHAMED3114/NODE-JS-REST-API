const Routes = require('express').Router();
const { getBootCamp, getBootCamps, updateBootCamp, deleteBootCamp, createBootCamp, getBootcampsInRadius, bootcampPhotoUpload } = require('../controllers/bootcamp');
const AdavanceQuery = require('../Middlewares/advanceResult');
const bootcampModel = require('../Models/bootcamp');
const authorizeMiddleware = require('../Middlewares/auth')
const roleBasedAuthorized = require('../Middlewares/RoleAuthorize');


//method-1  inlcude other resources routes.. this method is not much good 
//const { getCourses } = require('../controllers/course')
//Routes.route('/:bootcampid/courses')
//    .get(getCourses)



// method-2 to include other resource routes 
const courseRouter = require('./courses');
Routes.use('/:bootcampid/courses', courseRouter)


Routes.route('/radius/:zipcode/:distance')
    .get(getBootcampsInRadius);

Routes.route('/')
    .get(AdavanceQuery(bootcampModel, 'courses'), getBootCamps)
    .post(authorizeMiddleware, roleBasedAuthorized('publisher', 'admin'), createBootCamp);

Routes.route('/:id')
    .get(getBootCamp)
    .put(authorizeMiddleware, roleBasedAuthorized('publisher', 'admin'), updateBootCamp)
    .delete(authorizeMiddleware, roleBasedAuthorized('publisher', 'admin'), deleteBootCamp);

Routes.route('/:id/photo')
    .put(authorizeMiddleware, roleBasedAuthorized('publisher', 'admin'), bootcampPhotoUpload);
/*
    router.use('/:bootcampid')
*/

module.exports = Routes;