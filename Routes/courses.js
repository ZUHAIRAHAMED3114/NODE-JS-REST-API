const Routes = require('express').Router({ mergeParams: true });
const { getCourses, getSingleCourse, createCourse, updateCourse, deleteCourse } = require('../controllers/course');
const AdavanceQuery = require('../Middlewares/advanceResult');
const CourseModel = require('../Models/course');
const authorizationMiddleware = require('../Middlewares/auth');
const roleBasedAuthorized = require('../Middlewares/RoleAuthorize');


Routes.route('/')
    .get(AdavanceQuery(CourseModel, 'bootcamp'), getCourses)
    .post(authorizationMiddleware, roleBasedAuthorized('admin', 'publisher'), createCourse);

Routes.route('/:id')
    .get(getSingleCourse)
    .put(authorizationMiddleware, roleBasedAuthorized('admin', 'publisher'), updateCourse)
    .delete(authorizationMiddleware, roleBasedAuthorized('admin', 'publisher'), deleteCourse)




module.exports = Routes;