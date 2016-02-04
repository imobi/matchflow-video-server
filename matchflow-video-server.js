if (Meteor.isClient) {
//  // counter starts at 0
//  Session.setDefault('counter', 0);
//
//  Template.hello.helpers({
//    counter: function () {
//      return Session.get('counter');
//    }
//  });
//
//  Template.hello.events({
//    'click button': function () {
//      // increment the counter when button is clicked
//      Session.set('counter', Session.get('counter') + 1);
//    }
//  });

    Meteor.subscribe("images");

    Template.imageView.helpers({
        images: function () {
            return Images.find(); // Where Images is an FS.Collection instance
        }
    });

    Template.myForm.events({
        'change .myFileInput': function (event, template) {
            FS.Utility.eachFile(event, function (file) {
                Images.insert(file, function (err, fileObj) {
                    //If !err, we have inserted new doc with ID fileObj._id, and
                    //kicked off the data upload using HTTP
                    
                    if (err){
                        // handle error
                    } else {
                        // handle success depending what you need to do
                        
                    }
                    
                });
            });
        }
    });
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
    });
}
