Video.allow({
    insert: function (userId, doc) {
        console.log('Video > insert');
        if(userId) {
            return true;
        } else {
            return true;
        }
    },

    remove: function (userId, doc){
        console.log('Video > remove');
        if(userId) {
            return true;
        } else {
            return true;
        }
    },

    update: function(userId, doc, fieldNames, modifier) {
        console.log('Video > update');
        if(userId) {
            return true;
        } else {
            return true;
        }
    },
    download: function(userId, doc) {
        console.log('Video > download');
        if(userId) {
            return true;
        } else {
            return true;
        }
    }
});

Meteor.publish('video', function () {
    return Video.find({});
});