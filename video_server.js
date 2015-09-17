// server.js
// modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var multer         = require('multer');
var ffmpeg         = require("fluent-ffmpeg");
var mongo 		   = require('mongodb');
var mongoose 	   = require('mongoose');
var fs 			   = require('fs');

//Set up and start our Node.js server

// set our port
var port = process.env.PORT || 3001; 

//Allow Cross Domain request (CORS)
//Integrate this later: https://github.com/expressjs/cors and specify origins allowed for secutiry purposes

app.use(function(req, res, next) {
	console.log("Running CORS middlesware");
  	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  	next();
});

//Set the directory path containing static files
//app.use(express.static(__dirname + '/public')); 

// routes ==================================================
//app.route('./app/routes');

// start app ===============================================
// startup our app at http://localhost:3001
app.listen(port);               

// shoutout to the user                     
console.log('Magic happens on port ' + port);

//Let's connect to MongoDB now
mongoose.connect('mongodb://localhost/flowbase', function(err) {
    if(err) {
        console.log('Connection error for MongoDB', err);
    } else {
        console.log('Connection successful to MongoDB');
    }
});

//Collections required: 
// 1. Project Credentials (username,password)
// 2. Storage Access Tokens (unique token string, expiry date)
// 3. Uploaded Videos (id, name, url)

//Schema for collections
var Schema = mongoose.Schema;

var projectsSchema = new Schema({
	username: String,
	password: String,
	date_created: {type: Date, default:Date.now}
});

var tokensSchema = new Schema({
	token_string: String,
	expiry_date: {type: Date}
});

var uploadedVideosSchema = new Schema({
	name: String,
	url: String,
	date_created: {type: Date, default:Date.now}
});

//Create Mongoose models from Schemas
var Projects = mongoose.model('Projects',projectsSchema);
var Tokens = mongoose.model('Tokens',tokensSchema);
var UploadedVideos = mongoose.model('UploadedVideos', uploadedVideosSchema);

//Adding test token
Tokens.create({token_string:"hi"}, function (err) {
	console.log("Added test token");
});

//Adding a method to Date prototype
Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}

//Add new project auth details to projects collection
app.use('/addProject', bodyParser.json(), function (request,response,next) {
	console.log("Adding project to Node server...");
	Projects.create({
		username:request.body.pid,
		password:request.body.password
	}, function (err) {
		response.send("Added details of project: PID "+request.body.pid + "Pw: "+ request.body.password);
	});	
});

app.use('/generateToken', bodyParser.json(), function (request,response,next) {
	//if the PID and password are valid then generate a new token
	Projects.find({username:request.body.pid, password:request.body.password}, function (error, docs) {
		if (!error && docs.length > 0) {
			//generate token
			var newToken = {
				token_string: request.body.pid.split("").reverse().join("")+""+Math.random()*1000+request.body.password.split("").reverse.join(""),
				token_expiry: Date.now.addHours(4)
			};
			console.log(newToken);
			response.send(newToken);
		}
		else {
			console.log("Invalid project authentication details.");
		}
	})

});

//Video Manager middleware

//Create global variable for file name of video
var newFileName;

//Parse the file name before uploading file
app.use('/fileName', bodyParser.json(),function (request,response,next) {
	newFileName = request.body.file_name;
	response.send("Done parsing file name:"+newFileName);
});

var videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, req.body.video_name+".mp4")
  }
})

var upload = multer({ storage: videoStorage })

app.post('/upload', upload.single('file'), function (req, res, next) {
	res.send(req.file.filename+" successfully uploaded!");
	console.log(req.body);
	console.log(req.file);
});


//Function gets the metadata (using ffprobe) of a video file passed to it, and then returns the metadata object
app.use('/getVideoMetaData',bodyParser.json(), function (request,response,next) {
	var fileName = request.body.fileName;
	var filePath = request.body.filePath;
	ffmpeg.ffprobe(filePath, function(err, metadata) {
		response.send(metadata);	
	}); 	
});

//Converts video using ffmpeg
app.use('/convert',bodyParser.json(), function (request,response,next) {
	var fileName = request.body.fileName;
	var filePath = request.body.filePath;
	var newVideoName = fileName.split('.')[0]+Date.now()+'.mp4'; //MR is for Maxflow Ready
	var savePath = 'public/Videos Converted/'+newVideoName;
	ensureExists('public/Videos Converted/', 0744, function(err) {
	    if (err) console.log("Count not create folder ",err); // handle folder creation error
	    else {
			console.log("Folder successfully created or already exists - no error");// we're all good
			var format = 'mp4';
			var convertedVideo = ffmpeg(filePath)
		    .fps(request.body.framerate)
		    .size(request.body.resolution)
		    .autopad()
		    .format(format)
		    .on('end', function() { response.send({"success":true, "video_name":newVideoName, "saved_path":savePath});})
		    .on('error',function(error) {response.send({"success":false, "error":error.message});})	
		    .on('progress', function(progress) { console.log('Processing: ' + progress.percent + '% done');})
		    .save(savePath);
		}
	});

});


//CRUD for Video Manager - Middleware

//CREATE: Adds video that has been converted to the videos collection in flowbase MongoDB
app.use('/addconvertedvideo', bodyParser.json(), function (request, response,next) {
	var videoName = request.body.video_name;
	var videoPath = request.body.saved_path;
	ffmpeg.ffprobe(videoPath, function(err, metadata) {
		//Now add to VideosConvertedCollection, -1 means undefined or unknown in the database
		var width = metadata.streams[0].width;
		var height = metadata.streams[0].height;
		var aspect = metadata.streams[0].display_aspect_ratio;
		var fr = metadata.streams[0].r_frame_rate.split('/');
		var frame_rate = Math.round(fr[0]/fr[1]);
		var codec = metadata.streams[0].codec_name;
		if (metadata.streams[0].width == undefined) width = -1;
		if (metadata.streams[0].height== undefined) height= -1; 
		if (aspect == "0:1" || aspect == undefined) currentAspect = -1;
		if (fr[0] == "0" || fr == undefined)  frame_rate = -1;
		
		//Create document for collection
		var newConvertedVideo = new VideosConvertedCollection({
			"video_name":videoName,
			"path":videoPath,
			"format":'mp4',
			"width":width,
			"height":height,
			"frame_rate": frame_rate,
			"aspect_ratio": aspect,
			"codec":codec
		});

		//Save the document to the database
		newConvertedVideo.save(function (err) {
			if (err) response.send({"success":false,"error":err})
			else response.send({"success":true});
		});
	}); 
});

//READ: Returns JSON object of all videos in the VideosConvertedCollection collection in MongoDB flowbase
app.use('/getconvertedvideos', function (request,response) {
	VideosConvertedCollection.find(function (err, videos) {
  		if (err) response.send("Error fetching videos from database.");
  		else { 
  			response.send(videos);
  		}
	});
});

//UPDATE: Not required right now. 
//Add an update function to the video manager which will allow the user to change vide name, and also convert video to different resolutions etc.

//DELETE: Remove video from collection and delete the corresponding video file as well.
app.use('/deletevideo', bodyParser.json(), function (request, response) {
	//Delete the actual video file
	fs.unlink(request.body.path, function (err) {
  		if (err) console.log(err);
  		else { 
  			//Now delete the database reference to the video file
  			VideosConvertedCollection.remove({"path":request.body.path} ,function (err) {
  				if (err) response.send({"success":false,"error":err});
  				else response.send({"success":true});
  			});
  		}
  	});
});

//POST response when /getvideopath is sent from front end with name of video, video path is fetched from the converted videos table
app.use('/getvideopath', bodyParser.json(),function (request,response) {
	console.log("Express is getting video path for "+request.body.video_name);
	VideosConvertedCollection.find({"video_name":request.body.video_name},function (err,video_data) {
		console.log("Fetched path..."+video_data[0].path);
		if (err) response.send("Error fetching video path from database.");
		else response.send({"success":true, "path":video_data[0].path});
	});
})


// Expose app so that server.js can be required by other modules        
exports = module.exports = app;     