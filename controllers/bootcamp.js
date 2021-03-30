const bootcamp = require('../Models/bootcamp');
const BootCampModel = require('../Models/bootcamp');
const ErrorResponse = require('../util/errorResponse');
const geoCoder = require('../util/geoCode');
const path = require('path');
const { Console } = require('console');
const fs = require('fs');



let bootCampRepository = {

    // desc :--> Get all BootCamps
    // Routes:--> Get/api/v1/bootcamps
    // access:--> Public
    getBootCamps: async(req, res, next) => {

        // console.log('get bootcamp cotrolller')
        //  console.log(req.query)
        // normally express convert the request query string into javascript object
        /*
                let query = {};
                let project = {};
                let pagination = {};

                //   MONGO DB SHELL   db.collection.find(query,projection)
                //   both query and projection are to be the document object....{document is nothing but json object}


                //   in mongoose for query either we can use the document/json based syntax or object Chaining based syntax
                /* 
                  .......... for filtering the collecitons.........in mongoose..........

                 object based syntx 
                    Person.
                         find({
                         occupation: /host/,
                         'name.last': 'Ghost',
                         age: { $gt: 17, $lt: 66 },
                         likes: { $in: ['vaporizing', 'talking'] }
                        })



                 method based syntax....
                    Person.
                    find({ occupation: /host/ }).
                    where('name.last').equals('Ghost').
                    where('age').gt(17).lt(66).
                    where('likes').in(['vaporizing', 'talking'])
                
                */


        /*
         .....for selecting/projecting  the collection ........in mongoose....
                
           const query = Person.findOne({ 'name.last': 'Ghost' });


        // selecting the `name` and `occupation` fields 
           selecting those feilds are seperated through the commas.....
           query.select('name occupation');


        */


        /*
                // fields to be excludes...
                const remove_feilds = ['select', 'sort', 'page', 'limit'];
                remove_feilds.forEach(feild => {
                    if (feild in req.query) {
                        project[feild] = req.query[feild];
                        delete req.query[feild];
                    }
                })
                query = req.query;

                if (Object.keys(req.query).length > 0) {

                    // creating a new Query String  
                    // normally express convert the request query string into javascript object
                    let queryStr = JSON.stringify(req.query);

                    // creating the comparison operator except in 
                    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|ne)\b/g, word => {
                        return '$' + word
                    })

                    // if query string contain the in operator then adjusting this operator
                    // based on the requirment of the mongo db.....
                    if (/\bin\b/.test(queryStr)) {
                        queryStr = inconversion(queryStr)
                    }
                    query = JSON.parse(queryStr);
                }
                console.log('query object')
                console.log(query);
                console.log('projection object')
                console.log(project)

                var Query = BootCampModel.find(query);

                // adding the projection query if it contain
                if ('select' in project) {
                    const Project_feilds = project.select.split(',').join(' ');

                    Query = Query.select(Project_feilds)
                }

                // adding the sorting query if it contain

                if ('sort' in project) {
                    const Sort_feilds = project.sort.split(',').join(' ');
                    Query = Query.sort(Sort_feilds)
                } else {
                    Query = Query.sort('-createdAt')
                }

                const page = parseInt(project.page, 10) || 1;
                const limit = parseInt(project.limit, 10) || 100;
                const startIndex = (page - 1) * limit;
                const endIndex = (page) * limit
                let count = await BootCampModel.countDocuments()

                console.log(` total document as ${count}`)
                console.log(` start index ${startIndex}`)
                console.log(`end index ${endIndex}`)

                // skipping and then limiting the documents
                Query = Query.skip(startIndex);
                Query = Query.limit(limit)


                // pagination    
                if (endIndex < count) {

                    pagination.next = {
                        page: page + 1,
                        limit
                    }

                }

                if (startIndex > 0) {
                    pagination.prev = {
                        page: page - 1,
                        limit
                    }
                }


        */

        let Query = req.query;
        let pagination = req.pagination;


        // executing the query based...... 
        Query.exec()
            .then(documents => {
                res.status(200).json({
                    success: true,
                    count: documents.length,
                    data: documents,
                    pagination

                });

            })
            .catch(err => {
                next(err);
            })


    },


    // desc :--> Get all BootCamps
    // Routes:--> Get/api/v1/bootcamps/:id
    // access:--> Public
    getBootCamp: (req, res, next) => {

        BootCampModel.findById(req.params.id)
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
                // this error is occured when bootCamp modle cannot cast the id paramter into the object_id
                err.name = 'CastError'
                next(err);
            })


    },


    // desc :--> Get all BootCamps
    // Routes:--> Get/api/v1/bootcamps
    // access:--> Public
    createBootCamp: (req, res, next) => {
        // from the req.body -> the data required for the bootcamp instace is came 
        // but data reletated to the user came from -> authorizeMiddleware which will add a req.user properties 

        let user = req.user;
        req.body.user = user.id;

        //user which is publiser can only add the  one bootcamp
        // where admin can add a multiple bootcamps 


        // we know i.e user role 
        BootCampModel.findOne({ user: req.user.id })
            .then(document => {

                if (!document) {
                    // you can add 
                    BootCampModel.create(req.body)
                        .then(document => {
                            res.status(201).json({
                                success: true,
                                data: document
                            })

                        }).catch(err => {

                            return next(err);

                        })





                } else {
                    // there are already documnet for i.e items so 
                    // if user role is publiser then he can only add one bootcamps
                    // if user role is admin thne he can add multiple bootcamps  

                    if (user.role === 'publisher') {
                        return next(new ErrorResponse('this user cannot able to add more than one bootcamp'))
                    }

                    BootCampModel.create(req.body)
                        .then(document => {
                            res.status(201).json({
                                success: true,
                                data: document
                            })

                        }).catch(err => {

                            return next(err);

                        })




                }
            })



        /*
                in order to create an instance in the database 
                 two ways 
             1)st-way
                steps to create a instance of the Model

                a)  new Model({
                          specify the json object 
                     })
                B)  finallly save the Model instance to the dataBase through
                     Model.save()
            
            
            2)nd-way 
                     a) there is no seperate creation and after i.e saving in the 
                        dataBase 

                     b) by Using the Create() method we can directly create 
                        an instance and save to the datbase
                
                    



             

        */



    },


    // desc :--> Get all BootCamps
    // Routes:--> Get/api/v1/bootcamps/:id
    // access:--> Public
    updateBootCamp: async(req, res, next) => {

        //        updating the bootcamp->   

        //        giving permission to the user who publisher this bootcamp                     ---->--->--->--->       { or }
        //        giving permission to the admin who can update this bootcamp                   ---->--->--->--->

        // first get the bootcamp infromation based on the bootcamp id
        let bootcamp;
        try {
            bootcamp = await BootCampModel.findById(req.params.id);
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



        BootCampModel.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true
            })
            .then(bootCamp => {
                // this is mogoose error i.e is no data is present for the particular id in the mongoose
                if (bootcamp === null) {
                    return next(new ErrorResponse('there is no file present for ' + req.params.id, 400, 'DocumentNotFound'))
                } else {

                    return res.status(200)
                        .json({
                            success: 'true',
                            data: bootCamp

                        })
                }

            })
            .catch(err => {
                err.name = 'CastError'
                next(err)
            })

    },


    // desc :--> Get all BootCamps
    // Routes:--> Get/api/v1/bootcamps/:id
    // access:--> Public
    deleteBootCamp: async(req, res, next) => {

        let bootcamp;
        try {
            bootcamp = await BootCampModel.findById(req.params.id);
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



        BootCampModel.findByIdAndDelete(req.params.id)
            .then(() => {

                res.status(204)
                    .json({
                        success: 'true',
                        id: req.params.id
                    })
            })
            .catch(err => {
                err.name = 'CastError'
                next(err);
            })

    },


    //desc  :-->  Get bootcamps within a radius
    //route :-->  Get /api/v1/bootcamps/radius/:zipcode/:distance
    //access:-->  private
    getBootcampsInRadius: async(req, res, next) => {
        const { zipcode, distance } = req.params;

        // Get Lattitude/logitude from the geoCoder
        const loc = await geoCoder.geocode(zipcode);

        const lattitude = loc[0].latitude;
        const longitude = loc[0].longitude

        console.log(lattitude);
        console.log(longitude);

        // calculating the radius= distance/EarthRadius
        // Earch Radius =6378 /3693 miles at the equator so 

        const radius = distance / 3963;
        const bootcamps = await bootcamp.find({
            location: {
                $geoWithin: {
                    $centerSphere: [
                        [longitude, lattitude], radius
                    ]
                }
            }
        })

        console.log(bootcamps[0].location.coordinates)

        res.status(200)
            .json({
                success: 'true',
                count: bootcamps.length,
                data: bootcamps

            })

    },


    //desc    :-->      Upload a photo for the bootcamp
    //@route  :-->      put/api/v1/bootcamps/:id/photo
    //@access :-->      private

    bootcampPhotoUpload: async(req, res, next) => {


        // giving permission to upload a image/photo

        let bootcamp;
        try {
            bootcamp = await BootCampModel.findById(req.params.id);
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











        let bootcampId = req.params.id;



        let file = req.files.file;
        let filename = `photo_${req.params.id}${path.extname(req.files.file.name)}`;
        let fileLocation = path.join('public', 'uploaded_photo', filename)



        if (!req.files.file.mimetype.startsWith('image')) {
            return next(new ErrorResponse('please upload the image ', 400))
        }
        if (file.size > process.env.MAX_FILE_UPLOAD) {
            return next(new ErrorResponse('please upload the image whose size is less than 1 megabyte', 404))
        }

        // saving the file in the server 
        file.mv(fileLocation, (err) => {
            if (!err) {

                BootCampModel.findByIdAndUpdate(bootcampId, { photo: filename })
                    .then(data => {
                        res.status(200)
                            .json({
                                success: true
                            })
                    })

            }
        })



        if (!req.files) {
            return next(new ErrorResponse(`please upload a file `, 400));
        }


    }

}

module.exports = bootCampRepository;