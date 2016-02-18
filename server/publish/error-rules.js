Errors.allow({
    insert: function (userId) {
        console.log('Images > insert');
        return (userId ? true : false);
    },
    remove: function (userId) {
        console.log('Images > remove');
        return (userId ? true : true);
    },
    update: function (userId) {
        console.log('Images > update');
        return (userId ? true : false);
    }
});

//Meteor.publish('errors', function () {
//    return Errors.find({});
//});