Meteor.subscribe("images");
Meteor.subscribe("videos");

Template.imageView.helpers({
    images: function () {
        return Images.find(); // Where Images is an FS.Collection instance
    }
});
Template.imageView.events({
    'click .deleteFileButton ': function (event) {
      console.log("deleteFile button ", this);
      Images.remove({_id: this._id});
    }
});

Template.imageForm.events({
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

Template.videoForm.events({
    'change .myFileInput': function (event, template) {
        FS.Utility.eachFile(event, function (file) {
            Videos.insert(file, function (err, fileObj) {
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

Template.videoView.helpers({
    file: function () {
        return Videos.findOne(this._id);
    },
    videos: function () {
        return Videos.find(); // Where Images is an FS.Collection instance
    },
    isReady: function () {
        if (this.isUploaded() && this.hasStored('videos')) {
            return true;
        } else {
            return false;
        }
    }
});
Template.videoView.events({
    'click .deleteFileButton ': function (event) {
      console.log("deleteFile button ", this);
      Videos.remove({_id: this._id});
    }
});


