'use strict';
var http = require('http');
var fs = require('fs');
var url = require('url');
var filePath = './tmp/youtube_video_info.tmp';

module.exports = function YoutubeSong(url, user, userID) {
  this.url = url;
  this.user = user;
  this.userID = userID;

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
    var infoUrl = 'http://youtube.com/get_video_info?video_id=' + id;

    console.log(infoUrl);

    var tmpFile = fs.createWriteStream(filePath);

    var request = http.get(infoUrl, function(response) {

      console.log(response);
      response.pipe(tmpFile);
      console.log(response);

      tmpFile.on('finish', function() {
        fs.close(tmpFile, function () {

          fs.readFile(filePath, 'utf8', function(err, data) {
            if(err) {
              console.error('File ' + filePath + ' can\'t be find');
            } else {
              console.log(data);
              var parsedData = URL.parse(data);
              console.log(parsedData);
              this.title = parsedData.title;
            }
          }); //readFile
        }); //Close
      }); //on finish
    }); //Request GET
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
  if(this.id != null) {
    this.getTitleFromId(this.id);
  }

  // var downloadFile = function() {
  //   //TODO
  // }
}
