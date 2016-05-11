var SESSION = {};
var SERVER = {
    totalSpace: 1000, // megabytes
    userAllocation: 500
};
// TODO take user permission code into account when allocating space

Meteor.startup(function () {
    
    // Set the max data length
    // 5mb = 5 * 1024 * 1024 = 5242880;
    HTTP.methodsMaxDataLength = 5242880;
    
    Accounts.config({
        forbidClientAccountCreation: true
    });
    var createUser = function (username, password) {
        return Accounts.createUser({
            '_id': username, // set the users id to be the same as its username
            'username': username,
            'password': password
        });
    };

    // Error handling
    JsonRoutes.ErrorMiddleware.use(RestMiddleware.handleErrorAsJson);
    // Enable cross origin requests for all endpoints 
    JsonRoutes.setResponseHeaders({
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    });

    // check if errors are defined
    if (!Errors.find().count()) {
        console.log('Initializing error codes...');
        Errors.insert({
            text: 'Access Denied',
            code: 100
        });
        Errors.insert({
            text: 'Session Expired',
            code: 200
        });
    }

    // create the admin user
    if (!Meteor.users.find().count()) {
        var users = [
            {username: 'admin', password: 'admin'}
        ];
        console.log('No users present, creating demo user...');
        _.each(users, function (user) {
            createUser(user.username, user.password);
        });
    }

    // **** NOTE : This is how you define a Meteor Collection > JSON response
    Meteor.publish('getvideos', function (id, key) {
        // TODO session keys and expiry must be set to 30min
        var expireIfOlderTime = new Date().getTime() - 1000 * 60 * 15; // subtract 15min
        if (SESSION[key] !== undefined && SESSION[key].timestamp > expireIfOlderTime) {
            console.log('requesting: ' + id);
            SESSION[key].timestamp = new Date().getTime();
            console.log('Updated session timeout for ' + SESSION[key].username);
            if (id === 'all') {
                // TODO need to add the users space info in this request as well
                // TODO request must only find video's for the authenticated user
                return Videos.find(
                        {'metadata.owner': SESSION[key].username},
                {fields: {_id: 1, original: 1, metadata: 1}}
                );
            } else {
                return Videos.find(
                        {_id: id, 'metadata.owner': SESSION[key].username},
                {fields: {_id: 1, original: 1}}
                );
            }
        } else {
            var responseData = {};
            if (SESSION[key] !== undefined && SESSION[key].timestamp <= expireIfOlderTime) {
                console.log('Session expired for ' + SESSION[key].username);
                return Errors.find(
                        {code: 200},
                {fields: {text: 1}}
                );
            } else {
                console.log('Access Denied');
                return Errors.find(
                        {code: 100},
                {fields: {text: 1}}
                );
            }

        }
    }, {
        url: 'videos/:0/:1',
        httpMethod: 'get'
    });

    // **** NOTE : This is a json response, NOT a meteor collection > JSON response
    // TODO change this to a POST
    // register API
    JsonRoutes.add('get', '/register/:key/:username/:password', function (req, res, next) {
        var key = req.params.key;
        var username = req.params.username;
        var password = req.params.password;

        var responseData = {};

        // TODO simple OTP and encryption/decryption must be setup
        // TODO add user capacity info (their role info), how much space, and for how long
        if (key === '1234567890') { // authentication key TODO autogen this using one time pad and it must be encrypted using public private key system
            console.log('creating user: ' + key + ',' + username + ',' + password);
            // TODO if user doesn't exist, create otherwise its just to get a session key
            // The session key must be stored in a MAP, and the session active timestamp must
            // be updated with each valid request made, if its older than 15min
            // the user must be relogged in and a new session key generated
            var sessionKey = Math.round(Math.random() * 1000000);
            SESSION[sessionKey] = {
                username: username,
                password: password,
                timestamp: new Date().getTime()
            };
            var user = Meteor.users.findOne({username: username});
            if (user === undefined) {
                console.log('creating new user: ' + username);
                createUser(username, password);
            } else {
                console.log('user already exists: ' + username);
            }
            console.log('sessionkey: ' + sessionKey);
            responseData = {
                status: sessionKey
            }; // TODO respond with a session key
        } else {
            console.log('registration denied');
            responseData = {
                status: 'Access Denied'
            };
        }

        JsonRoutes.sendResult(res, {
            data: responseData
        });
    });
    
    var fs = Meteor.npmRequire('fs');
    var __dirname=fs.realpathSync('.');
    console.log('Current Directory: '+__dirname);
    
    var REQUEST_MAP = {};
        
    // TEST
    JsonRoutes.add('get', '/videotest/', function (req, res, next) {
        var key = '';//req.params.key;
        var fileObj = Videos.findOne(
            {'_id': 'g79FN3H62Ai7AxXFh'},
            {fields: {_id: 1, original: 1, metadata: 1}}
        );
        var total = fileObj.size();
        var range = req.headers.range;
        if (range === undefined) {
            range = '';
        }
        var positions = range.replace(/bytes=/, "").split("-");
        var start = parseInt(positions[0], 10);
        var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
        var chunkSize = (end-start)+1;
        
        var headerKeyString = "bytes "+start+"-"+end+"/"+total;
        res.writeHead(206, {
            "Accept-Ranges":"bytes",
            "Content-Range": headerKeyString,
            "Content-Length": chunkSize,
            "Content-Type": "video/mp4"
        });
        var data = '';
         
        console.log('File to stream: '+fileObj.url());
        console.log('Requested Headers: '+headerKeyString);
//        var testStream = fileObj.createReadStream('videos');
        //var testStream = fs.createReadStream(__dirname+'\\'+fileObj.name());
        if (REQUEST_MAP[headerKeyString] === undefined) {
            REQUEST_MAP[headerKeyString] = fs.createReadStream('G:/kick.mp4');
        }
        //console.log('Stream: ',readStream); 
        
        var streamToUse = fs.createReadStream('G:/kick.mp4');
        // I THINK ITS GETTING MULTIPLE REQUESTS
        // NEED TO SPLIT THIS UP INTO DISTINCT REQUEST SLOTS
//        var streamToUse = REQUEST_MAP[headerKeyString];
//        var vidArr = [];
        streamToUse.on('open', function() { 
            streamToUse.pipe(res);
            console.log('open');
            return;
        }).on('close', function() { 
            console.log('close ');
            REQUEST_MAP[headerKeyString] = undefined;
            return;
        }).on('readable', function() { // use this instead of "data"
            var chunk = streamToUse.read();
            console.log('readable - chunk:',chunk);
            //res.write(chunk);
//            vidArr[vidArr.length] += chunk;
            res.write(chunk,'binary');
            return chunk;
        }).on('end', function() {
            console.log('end');
//            res.end(vidArr,'binary');
            streamToUse.close();
            return;
        }).on('error', function(err) {
            console.log('error '+err);
            res.end('error',err);
            return;
        });
        
        //REQUEST_MAP[headerKeyString].pipe(res);
        

        
//        
//        console.log('file: '+file.size());
//        fs.stat(file.url(), function (err) {
//            var total = file.size();
//            var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
//            var chunksize = (end - start) + 1;
//
//            res.writeHead(206, {
//                "Content-Range": "bytes " + start + "-" + end + "/" + total,
//                "Accept-Ranges": "bytes",
//                "Content-Length": chunksize,
//                "Content-Type": "video/mp4"
//            });
//
//            var stream = fs.createReadStream(file.url(), {start: start, end: end})
//                .on("open", function () {
//                        stream.pipe(res);
//                })
//                .on("error", function (err) {
//                    res.end(err);
//                });
//        });
    });

//
//    var mongoDB = Meteor.npmRequire('mongodb');
//    var Grid = Meteor.npmRequire('gridfs-stream');
//
//    // create or use an existing mongodb-native db instance
//    var db = mongoDB.Db;
//    db.open(function(err, db) {
//        var gfs = Grid(db, mongoDB);
//        db.authenticate('admin', '123456', function(err, result) {
//            //Can do queries here
//          
//          
//            db.close();
//        });
//    });
    


});


