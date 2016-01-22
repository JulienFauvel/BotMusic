'use strict';

var fs = require('fs');
var exec = require('child_process').exec;
var ytdl = require('ytdl-core');

function convertFlvToMp3(source_file, destination_dir, callback) {
  var destination_file = source_file.split('/').slice(-1)[0].replace('.flv', '.mp3');

  var ffmpeg = 'ffmpeg -i '+ source_file + ' ' + destination_dir + destination_file;
  var child = exec(ffmpeg, function(err, stdout, stderr) {
    if(err) {
      callback(err);
    } else {
      //Delete the movie file from the directory
      var rm = 'rm ' + source_file;
      console.log(source_file.split('/').slice(-1)[0] +' converted to '+ destination_file);
      callback();
      exec(rm, function (err, stdout, stderr) {
        if (err) {
          console.log(error);
        }
      });
    }
  }); //Exec ffmpeg
}


module.exports = {
  downloadVideo: function(url, dir_dest, file_dest, callback) {
    var stream = ytdl(url).pipe(fs.createWriteStream(dir_dest + file_dest));
    stream.on('finish', function () {
      convertFlvToMp3(dir_dest + file_dest, dir_dest, callback);
    });
  }
}
