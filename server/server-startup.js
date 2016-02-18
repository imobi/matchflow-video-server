var SESSION = {};
var SERVER = {
    totalSpace: 1000, // megabytes
    userAllocation: 100
};
// TODO take user permission code into account when allocating space

Meteor.startup(function () {
    Accounts.config({
        forbidClientAccountCreation: true
    });
    var createUser = function (username, password) {
        return Accounts.createUser({
            "username": username,
            "password": password
        });
    };

    // Error handling
    JsonRoutes.ErrorMiddleware.use(RestMiddleware.handleErrorAsJson);
    // Enable cross origin requests for all endpoints 
    JsonRoutes.setResponseHeaders({
        "Cache-Control": "no-store",
        "Pragma": "no-cache",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
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
    Meteor.publish("getvideos", function (id, key) {
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
                        {},
                        {fields: {_id: 1, original: 1}}
                );
            } else {
                return Videos.find(
                        {_id: id},
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
                return Errors.find(
                    {code: 100},
                    {fields: {text: 1}}
                );
            }
            
        }
    }, {
        url: "videos/:0/:1",
        httpMethod: "get"
    });

    // **** NOTE : This is a json response, NOT a meteor collection > JSON response
    // register API
    JsonRoutes.add("get", "/register/:key/:username/:password", function (req, res, next) {
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
});


