Meteor.startup(function () {
    // SETUP SERVER API's HERE
    Meteor.publish('get-videos', function (id) {
        console.log('requesting: '+id);
        if (id === 'all') {
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
    }, {
        url: 'videos/:0',
        httpMethod: 'get'        
    });
});


