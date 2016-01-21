'use strict';

var http = require('http');
var fs = require('fs');
var request = require('request');

//Generator of ID
var DOWNLOAD_DIR = './musics/';

module.exports = function YoutubeSong(urlVideo, username, userID) {

  //Validates URL
  var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
  var match = urlVideo.match(regExp);

  if (match && match[2].length == 11) {
    this.id = Date.now();
    this.videoUrl = urlVideo;
    this.username = username;
    this.userID = userID;
    this.isValid = true;

    this.videoID = urlV.split('v=')[1];
    var ampersandPosition = videoID.indexOf('&');
    if(ampersandPosition != -1) {
      this.videoID = videoID.substring(0, ampersandPosition);
    }

  } else {
    this.isValid = false;
  }


  //Return the id of a Youtube video's url
  YoutubeSong.prototype.getIdFromUrl = function(urlV) {
    var videoId = urlV.split('v=')[1];
    var ampersandPosition = videoId.indexOf('&');
    if(ampersandPosition != -1) {
      videoId = videoId.substring(0, ampersandPosition);
    }

    return videoId;
  }

  YoutubeSong.prototype.downloadSong = function(callback) {
    var downloadFile = function(url, dest, cb) {
      var file = fs.createWriteStream(dest);
      var sendReq = request.get(url);

      // verify response code
      sendReq.on('response', function(response) {
        if (response.statusCode !== 200) {
          return cb('Response status was ' + response.statusCode);
        }
      });

      // check for request errors
      sendReq.on('error', function (err) {
        fs.unlink(dest);
        if(cb) return cb(err.message);
      });

      sendReq.pipe(file);

      file.on('finish', function() {
        file.close(cb);  // close() is async, call cb after close completes.
      });
      file.on('error', function(err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        if(cb) return cb(err.message);
      });
    }

    var youtubeSong = this;
    var options = {
      host: 'www.youtubeinmp3.com',
      port: 80,
      path: '/fetch/?format=JSON&video=' + this.videoUrl
    };


    http.request(options, function(res) {
      var str = '';
      let cb = callback;
      res.on('data', function(chunk) {
        str += chunk;
      });

      res.on('end', function() {
        var obj = JSON.parse(str);
        if(obj['length']) {
          downloadFile(obj['link'], DOWNLOAD_DIR + youtubeSong.id + '.mp3', callback);
        } else if(callback){
          callback('Video too long');
        }
      });
    }).end();
  }

  if(this.isValid) {
    this.id = this.getIdFromUrl(this.videoUrl);
  }
}
