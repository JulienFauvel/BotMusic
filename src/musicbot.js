'use strict';

var DiscordClient = require('discord.io');
var YoutubeSong = require('./youtubesong');
var auth = require('../auth.json');
var http = require('http');
var fs = require('fs');

var DOWNLOAD_DIR = './musics/';

var audioStream = null;
var currentSong = null;
var queue = Array();
var skipArray = Array();

var bot = new DiscordClient({
  autorun: true,
  email: auth.email,
  password: auth.password
});

bot.on('message', function(username, userID, channelID, message, rawEvent) {
  var cmd = message.toLowerCase().split(" ")[0];
  console.log(cmd);
  switch (cmd) {
    case "!come":
    case "!came": {
      joinChannel(userID, channelID);
    } break;

    case "!addsong": {
      addSong(message.split(" ")[1], username, userID);
    } break;

    case "!skip": {
      skip(userID);
    } break;

    case "!reset": {
      reset();
    } break;

    case "!start": {
      start();
    } break;

    case "!stop": {
      stop();
    } break;
  }
});

function addSong(url, username, userID) {
  if(url && url.length > 0) {

    var youtubeSong = new YoutubeSong(url, username, userID);

    var exist = false;

    var files = fs.readdirSync(DOWNLOAD_DIR);
    for (var i = 0; i < files.length; i++) {
      if(files[i] == youtubeSong.id + '.mp3') {
        exist = true;
        break;
      }
    }

    if(exist && youtubeSong.isValid) {
      console.log('Music already download, adding to queue...');
      queue.push(youtubeSong);
      if(currentSong == null) {
        start();
      }
    } else {
      //If url is wrong
      if(youtubeSong.isValid) {
        youtubeSong.downloadSong(function (err) {
          if(err) {
            console.log(err);
            sendMessage('@' + youtubeSong.username + ' Impossible to load ' + youtubeSong.url);
          } else {
            queue.push(youtubeSong);
            console.log(queue);
            if(currentSong == null) {
              start();
            }
          }
        });
      }
    }
  }
}

//reset the queue
function reset() {
  queue.length = 0
}

//Start the first song in the queue
function start() {
  if(queue.length > 0) {
    currentSong = queue[0];
    if(currentSong && currentSong.isValid) {
      var songPath = DOWNLOAD_DIR + currentSong.id + '.mp3';
      console.log(songPath);
      audioStream.playAudioFile(songPath);
      audioStream.once('fileEnd', nextSong);
    }
  } else {
    currentSong = null;
  }

}

//Stop the audio
function stop() {
  audioStream.stopAudioFile();
  if(queue.length > 0) {
    queue.shift()
  }
  currentSong = null;
}

//Start the next song if there is one
function nextSong() {
  stop();
  queue.shift();
  start();
}


//Skip if more than 50% of the users have typed !skip
function skip(userID) {
  console.log(bot.servers[0]);
  if (skipArray == null) {
    skipArray = Array(bot.servers[0].members.length);
    skipArray.fill(0);
  }

  skipArray[userID] = 1;

  var skipSum = 0;
  for (var i = 0; i < skipArray.length; i++) {
    skipSum += skipArray[i];
  }

  var onlineMembers = 0;
  for (var i = 0; i < bot.servers[0].members.length; i++) {
    if (bot.servers[0].members[i].status == "online")
      onlineMembers++;
  }

  if (skipSum > (onlineMembers / 2)) {
    if (queue.length > 0) {
      nextSong();
    }
    console.log('Skipped song')
    skipArray.fill(0);
  }
}


//Return the voice channel where the user is
function findVoiceChannelIdWhereUserIs(userID) {
  var voiceChannel = null;
  for(var s in bot.servers) {
    for(var uID in bot.servers[s].members) {
      if(uID == userID) {
        voiceChannel = bot.servers[s].members[uID].voice_channel_id;
      }
    }
  }

  return voiceChannel;
}

//Join the voice channel where the user is
function joinChannel(userID, channelID) {
  var voiceChannel = findVoiceChannelIdWhereUserIs(userID);

  if(voiceChannel != null) {
    bot.joinVoiceChannel(voiceChannel, function () {
      bot.getAudioContext({channel: voiceChannel, stereo: true}, function(stream) {
          audioStream = stream;
      });
    });
  }
}

function sendMessage(message, channelID) {
  bot.sendMessage({
    to: channelID,
    message: bot.fixMessage(message)
  });
}

function debug() {
  console.log('currentSong : ' + currentSong);
  console.log('queue : ' + queue);
}


bot.on('ready', function(rawEvent) {
  console.log(bot.username + " connected (" + bot.id + ")");
//  setInterval(debug, 5000);
//  addSong('https://www.youtube.com/watch?v=zK44QmjAocE', 'Okawi', '12345678901234567890');
});
