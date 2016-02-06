var videoStoreGridFS = new FS.Store.GridFS("video", {
    mongoUrl: 'mongodb://127.0.0.1:3001/meteor'
});

Video = new FS.Collection("video", {
  stores: [videoStoreGridFS]
});
