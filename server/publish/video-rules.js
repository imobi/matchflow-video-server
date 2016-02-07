Videos.allow({
    insert: function (userId, doc) {
        console.log('Videos > insert');
        if(userId) {
            return true;
        } else {
            return true;
        }
    },

    remove: function (userId, doc){
        console.log('Videos > remove');
        if(userId) {
            return true;
        } else {
            return true;
        }
    },

    update: function(userId, doc, fieldNames, modifier) {
        console.log('Videos > update');
        if(userId) {
            return true;
        } else {
            return true;
        }
    },
    download: function(userId, doc) {
        console.log('Videos > download');
        if(userId) {
            return true;
        } else {
            return true;
        }
    }
});

Meteor.publish('videos', function () {
    return Videos.find({});
});