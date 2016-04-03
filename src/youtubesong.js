'use strict';

var http = require('http');
var fs = require('fs');
var dm = require('./downloadmanager');

var DOWNLOAD_DIR = './musics/';

module.exports = function YoutubeSong(videoUrl, username, userID) {

  //Validates URL
  var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
  var match = videoUrl.match(regExp);

  if (match && match[2].length == 11) {
    this.videoUrl = videoUrl;
    this.username = username;
    this.userID = userID;
    this.isValid = true;

    //Extract the video's ID from the url
    this.id = this.videoUrl.split('v=')[1];
    var ampersandPosition = this.id.indexOf('&');
    if(ampersandPosition != -1) {
      this.id = this.id.substring(0, ampersandPosition);
    }

  } else {
    this.isValid = false;
  }

  YoutubeSong.prototype.downloadSong = function(callback) {
    var dir_dest = DOWNLOAD_DIR;
    var file_dest = this.id + '.flv';
    dm.downloadVideo(
      this.videoUrl,
      dir_dest,
      file_dest,
      callback
    );
  }
}
