'use strict';

var fs = require('fs');
var exec = require('child_process').exec;
var ytdl = require('ytdl-core');

function convertFlvToMp3(source_file, destination_dir, callback) {
  var destination_file = source_file.split('/').slice(-1)[0].replace('.flv', '.mp3');
  var ffmpeg = 'ffmpeg -y -i '+ source_file +' -f mp3 -vn -acodec copy ' + destination_file;
  var child = exec(ffmpeg, function(err, stdout, stderr) {
    if(err) {
      callback(err);
    } else {
      //Delete the movie file from the directory
      var rm = 'rm ' + source_file;
      exec(rm);
      console.log(source_file.split('/').slice(-1)[0] +' converted to '+ destination_file);
      callback();
    }
  }); //Exec ffmpeg
}


module.exports = {
  downloadVideo: function(url, dest, callback) {
    var stream = ytdl(url).pipe(fs.createWriteStream(dest));
    console.log(dest + '\n' + dest.replace('.flv', '.mp3'));
    stream.on('finish', function () {
      convertFlvToMp3(dest, dest.replace('.flv', '.mp3'), callback);
    });
  }
}
