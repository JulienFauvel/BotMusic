'use strict';
var http = require('http');
var fs = require('fs');
var url = require('url');

module.exports = function YoutubeSong(url, user, userID) {
  this.url = url;
  this.user = user;
  this.userID = userID;

  YoutubeSong.prototype.getTitleById = function(id) {
    var infoUrl = 'http://youtube.com/get_video_info?video_id=' + id;
    var tmpFile = fs.createWriteStream('./tmp/youtube_video_info.tmp');

    var request = http.get(infoUrl, function(argument) {
      response.pipe(tmpFile);
      file.on('finish', function() {
        file.close(readInfoFile(file));
      });
    });
  };

  //Return the id of a Youtube video's url
  YoutubeSong.prototype.getIdFromUrl = function(url) {
    var videoId = url.split('v=')[1];
    var ampersandPosition = videoId.indexOf('&');
    if(ampersandPosition != -1) {
      videoId = videoId.substring(0, ampersandPosition);
    }

    return videoId;
  }

  YoutubeSong.prototype.getTitleFromId = function(id) {
    var filePath = './tmp/youtube_video_info.tmp';
    var infoUrl = 'http://youtube.com/get_video_info?video_id=' + id;

    console.log(infoUrl);

    var tmpFile = fs.createWriteStream(filePath);

    var request = http.get(infoUrl, function(response) {
      response.pipe(tmpFile);

      tmpFile.on('finish', function() {
        tmpFile.close(function (filePath) {
          console.log("Filepath : " + filePath);

          fs.readFile(filePath, 'utf8', function(err, data) {
            if(err) {
              console.error('File ' + filePath + ' can\'t be find');
            } else {
              console.log(data);
              var parsedData = url.parse(data);
              console.log(parsedData);
              this.title = parsedData.title;
            }
          }); //readFile
        }); //Close
      }); //On finish
    }); //Request GET
  }

  YoutubeSong.prototype.readInfoFile = function (file) {
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
  this.getTitleFromId(this.id);

  // var downloadFile = function() {
  //   //TODO
  // }
}
