const ErrorResponse = require('../util/errorResponse');
const CourseModel = require('../Models/course');
const BootcampModel = require('../Models/bootcamp');




const courseController = {

    //@desc  :-> Get Courses
    //@route :-> Get /api/v1/courses
    //@route :-> Get /api/v1/bootcamps/:bootCampeId/courses
    // access:-> public

    getCourses: async function(req, res, next) {
        let query;
        /*
            i does't know -> req.params.bootcampid will showin some error
            
            req.params={
                  bootcampid:''
            }

          so i done the logic by considering the
          req.params as object
          instead i.e
          req.params as dicitonary

        */
        if (Object.keys(req.query) > 0) {
            query = req.query;
        }
        if (req.addQuery) {
            query = req.query;
        } else {
            if (Object.keys(req.params).length > 0) {
                query = CourseModel.find({ bootcamp: Object.values(req.params)[0] })
            } else {
                query = CourseModel.find();

            }

        }

        let pagination = req.pagination;







        const courses = await query;
        res.status(200)
            .json({
                succes: true,
                count: courses.length,
                data: courses,
                pagination
            })


    },

    //@route :-> Get /api/v1/courses/:id
    getSingleCourse: function(req, res, next) {

        /*
            we observed errors are like 
             -> id cast errors  (conversion of the id into object_id) 
             -> for get request there is not present of the Mongoose error :->
             -> but when id type is objectId :-> in database for i.e id there is not present of 
             -> resources then it will return document as null -> so we have to send 400 error // i.e is  there is no resource [present ]
        */
        var id = req.params.id;

        console.log(id)

        CourseModel.findById(id).populate({
                path: 'bootcamp',
                select: 'name description'
            })
            .then(document => {
                // this below error is when the id is not found in the data base {so this is mongoose error}
                if (document === null) {
                    return next(new ErrorResponse('there is no file present for ' + req.params.id, 400, 'DocumentNotFound'))
                }

                res.status(200)
                    .json({
                        success: true,
                        data: document
                    })
            })
            .catch(err => {
                err.name = 'CastError';

                next(err);
            })

    },
    //@desc  :-> creatubg a new course for the particular bootcamp
    //@route :-> post /api/v1/bootcamps/:bootCampeId/courses
    //access :-> private
    createCourse: async function(req, res, next) {

        // adding the bootcamp data to the course 
        let bootCampid = req.params.bootcampid;

        let data = req.body;

        // to this data we are adding the course RelatonShip like course -> bootcamp and course ->  user

        data.bootcamp = bootCampid;
        data.user = req.user.id;

        // similalrly adding the user data to the  course
        // we are getting the user infromation from the req.user --> 

        // now checking the user who created the bootcamp .The same user will adding the courses or other will be adding 
        let bootcamp;
        try {
            bootcamp = await BootcampModel.findOne({ _id: bootCampid });
            if (bootcamp === null) { return next(new ErrorResponse('there is no file present for ' + req.params.id, 400, 'DocumentNotFound')) }

        } catch (error) {
            // here we observe error is  casting error so
            error.name = 'CastError'
            return next(error)
        }

        // checking wheather the user is admin or the owner  who publish this bootcamp

        if (req.user.role != 'admin' || req.user.id != bootcamp.user) {
            return next(new ErrorResponse('you have not permission to update this bootcampe', 403))
        }

        //------------------------------checking -------------------------------------------------------------



        var newCourse = new CourseModel(data);
        var result = await newCourse.save();
        res.status(201)
            .json({
                success: true,
                data: result
            })
    },

    //@desc   :-> Updating the Course
    //@Route  :-> Put:-> api/v1/courses/:id
    //acces   :-> private

    updateCourse: async function(req, res, next) {
        let courseId = req.params.id;
        let userId;


        try {
            let courseDocument = await CourseModel.findById(courseId);
            if (!courseDocument) {
                return next(new ErrorResponse(`there is no document for the current ${courseId}`, 404))
            }
            userId = courseDocument.user;

        } catch (error) {
            // here mainly error is to be occured is cast Error
            error.name = 'CastError';
            return next(error)

        }

        // check wheather the use who pulbish the course will only update this course
        //

        if (req.user.id != userId) {
            return next(new ErrorResponse('you have not permission to update this course', 403))
        }



        CourseModel.findByIdAndUpdate(courseId, req.body, {
                new: true,
                runValidators: true
            })
            .then(result => {
                res.status(201)
                    .json({
                        success: true,
                        data: result
                    })

            })
            .catch(err => {
                // here mainly error occured is validation error so
                next(err);
            })

    },

    //@desc   :-> Updating the Course
    //@Route  :-> Put:-> api/v1/courses/:id
    //acces   :-> private
    deleteCourse: function(req, res, next) {
        let courseId = req.params.id;


        CourseModel.findById(courseId)
            .then(document => {

                if (document != null) {

                    // before deleting this course :-> we check
                    // wheather the user who publish the course will only deleting the course or other use will deleting the course
                    if (document.user != req.user.id) {
                        return next(new ErrorResponse('you have not permission to update this course', 403))
                    }

                    document.remove()
                        .then(() => {

                            res.status(204)
                                .json({
                                    success: true,

                                })

                        })
                } else {
                    next(new ErrorResponse('data for the particulare is ' + courseId + 'is not present in the data Base'))
                }


            })
            .catch(error => {
                // mainly here the error is occured is castError

                error.name = 'CastError';
                next(error);
            })

    }




}

module.exports = courseController;