'use strict';

var http = require('http');
var fs = require('fs');
var request = require('request');
var downloadManager = require('./downloadmanager');

var DOWNLOAD_DIR = './musics/';

module.exports = function YoutubeSong(videoUrl, username, userID) {

  //Validates URL
  var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
  var match = videoUrl.match(regExp);

  if (match && match[2].length == 11) {
    this.id = Date.now();
    this.videoUrl = videoUrl;
    this.username = username;
    this.userID = userID;
    this.isValid = true;

    //Extract the video's ID from the url
    this.videoID = this.videoUrl.split('v=')[1];
    var ampersandPosition = this.videoID.indexOf('&');
    if(ampersandPosition != -1) {
      this.videoID = videoID.substring(0, ampersandPosition);
    }

  } else {
    this.isValid = false;
  }

  YoutubeSong.prototype.downloadSong = function(callback) {
    console.log('Type of callback : '+ typeof callback);
    var dest = DOWNLOAD_DIR + this.id + '.flv';
    downloadManager.downloadVideo(
      this.videoUrl,
      dest,
      callback
    );
  }
}
