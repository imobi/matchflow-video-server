Meteor.startup(function () {
    var createUser = function (username,  password) {
        return Accounts.createUser({
            "username": username,
            "password": password
        });
    };
    // create the admin user
    if (!Meteor.users.find().count()) {
        var users = [
            { username:'admin', password: 'admin' }
        ];
        console.log('No users present, creating demo user...');
        _.each(users, function (user) {
            createUser(user.username, user.password);
        });
    }
    
    
    // SETUP SERVER API's HERE
    // videos API
    Meteor.publish('get-videos', function (id,key) {
        // TODO session keys and expiry must be set to 30min
        if (key === '1234') {
            console.log('requesting: '+id);
            if (id === 'all') {
                // TODO need to add the users space info in this request as well
                return Videos.find(
                    {},
                    { fields: { _id:1, original:1 } }
                );
            } else {
                return Videos.find(
                    { _id: id },
                    { fields: { _id:1, original:1 } }
                );
            }
        } else {
            return { status:'denied' }; // TODO respond properly
        }
    }, {
        url: 'videos/:0/:1',
        httpMethod: 'get'        
    });
    // register API
    Meteor.publish('users', function (key,username,password) {
        // TODO simple OTP and encryption/decryption must be setup
        // TODO add user capacity info (their role info), how much space, and for how long
        if (key === '1234') {
            console.log('creating user: '+key+','+username+','+password);
            createUser(username,password);
            return { status:'1234' }; // TODO respond with a sessiom key
        } else {
            console.log('registration denied');
            return { status:'denied' };
        }
    }, {
        url: 'register/:0/:1/:2',
        httpMethod: 'get'        
    });
});


