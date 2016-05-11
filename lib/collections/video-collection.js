var videoStoreGridFS = new FS.Store.GridFS("video", {
    mongoUrl: 'mongodb://127.0.0.1:3006/meteor'
});

Videos = new FS.Collection("videos", {
  stores: [videoStoreGridFS]
  //stores: [new FS.Store.FileSystem("video", {path: "./uploads"})]
});
