'use strict';
var http = require('http');
var fs = require('fs');

var request = require('request');

var URL = require('url');

var GEN_ID = 1;
var DOWNLOAD_DIR = './musics/';


module.exports = function YoutubeSong(url, user, userID) {
  this.url = url;
  this.user = user;
  this.userID = userID;
  const id_video = GEN_ID++;

  //Return the id of a Youtube video's url
  YoutubeSong.prototype.getIdFromUrl = function(url) {
    var videoId = url.split('v=')[1];
    var ampersandPosition = videoId.indexOf('&');
    if(ampersandPosition != -1) {
      videoId = videoId.substring(0, ampersandPosition);
    }

    return videoId;
  }

  YoutubeSong.prototype.getSongInformation = function() {
    var options = {
      host: 'www.youtubeinmp3.com',
      port: 80,
      path: '/fetch/?format=JSON&video=' + this.url
    };

    http.request(options, function(res) {
      var str = '';
      res.on('data', function(chunk) {
        str += chunk;
      });
      res.on('end', function() {
        var obj = JSON.parse(str);
        console.log('str' + str);
        console.log('obj' + obj);
        download(obj['link'], DOWNLOAD_DIR + obj['link'] + '.mp3', function (err) {
          if(err) {
            console.log(err);
          } else {
            console.log('Downloaded file without errors');
          }
        });
      }); //Response on end, First GET request
    }).end();//GET Request (JSON)


  }

  YoutubeSong.prototype.downloadSong = function(url, dest, cb) {
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

  YoutubeSong.prototype.readInfoFile = function(file) {
    fs.readFile(file, 'utf8', function(err, data) {
      if(err) {
        console.error('File ' + file + ' can\'t be find');
      } else {
        console.log(data);
        var parsedData = url.parse(data);
        console.log(parsedData);
        this.title = parsedData.title;
      }
    });
  }

  this.id = this.getIdFromUrl(this.url);
  this.getSongInformation();
}
