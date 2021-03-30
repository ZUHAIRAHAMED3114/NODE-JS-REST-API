module.exports = (ModelSchema, populate) => {


    return async(req, res, next) => {


        let query = {};
        let project = {};
        let pagination = {};


        const removeFeilds = ['select', 'sort', 'limit', 'skip', 'page'];
        removeFeilds.forEach(eachFeild => {
            if (eachFeild in req.query) {
                project[eachFeild] = req.query[eachFeild]
                delete req.query[eachFeild];
            }

        });
        // except sort,select,limit,skip operator we use sepeartte mongoose method 
        // for comparisonal operator like gt,lt,gte,lte we use direct object i.e we we are 
        // assigning the req.query direct to the database query 
        // i.e means we are querying to the data base based on the json Object 


        query = req.query;

        if (Object.keys(req.query).length > 0) {
            let queryString = JSON.stringify(req.query);
            queryString = queryString.replace(/\b(gt|lt|gte|lte)\b/, word => {
                return '$' + word;
            })

            query = JSON.parse(queryString);
        }
        var QueryResult
        if (Object.keys(query).length > 0)
            QueryResult = ModelSchema.find(query)
        else {
            QueryResult = ModelSchema.find({})
        }

        /*
                // for in comparsion operators....
                // dfs traversal 
                function dfs(obj, operator) {
                    if (Object.keys(obj).find(operator)) {
                        return obj
                    }

                    Object.values(obj)
                        .forEach(value => {
                            if (typeof value === 'object')
                                dfs(value)
                        })

                    return null;
                }

                let obj = dfs(req.query, 'in');
                if (obj !== null) {
                    QueryResult.where(obj)
                        .in(
                            req.query.obj.split(',')
                        )

                }

                let obj2 = dfs(req.query, 'all');
                if (obj2 !== null) {
                    QueryResult.where(obj)
                        .all(
                            req.query.obj2.split(',')
                        )

                }

          */
        // upto above  filter query is completed 

        if ('select' in project) {
            // query in mongoose for projection as follows 
            //  Query.select("feild1 feilds2 feild3 feild4")    
            const Project_feilds = project.select.split(',').join(' ');
            QueryResult = QueryResult.select(Project_feilds)
        }


        if ('sort' in project) {
            // if sort is to be done based on more than 2 or more feilds 
            const Sort_feilds = project.sort.split(',').join(' ');
            QueryResult = QueryResult.sort(Sort_feilds)
        } else {
            QueryResult = QueryResult.sort('-createdAt')
        }


        const page = parseInt(project.page, 10) || 1;
        const limit = parseInt(project.limit, 10) || 100;
        const startIndex = (page - 1) * limit;
        const endIndex = (page) * limit



        //let count = await ModelSchema.countDocuments({});

        // skipping 
        QueryResult = QueryResult.skip(startIndex);
        // limiting 
        QueryResult = QueryResult.limit(limit);

        console.log(QueryResult);
        //making the join with populate
        if (populate) {
            QueryResult = QueryResult.populate(populate)
        }

        // creating a  pagination .... 
        let count = await ModelSchema.countDocuments();
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


        // after making this middleware 
        // now using this for different types for modelSchema 
        // finally we are returning the 
        // QueryResult + pagination options
        // but middleware s nothing to be returned but we will be attaached to the request object
        req.addQuery = ('skip' in project) || ('limit' in project) || ('select' in project) || ('sort' in project);
        req.query = QueryResult;
        req.pagination = pagination

        console.log(req.addQuery);
        next();



    }

}