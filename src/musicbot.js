'use strict';

var DiscordClient = require('discord.io');
var YoutubeSong = require('./youtubesong.js');
var auth = require('../auth.json');
var http = require('http');
var fs = require('fs');
var URL = require('url');

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

bot.on('message', function(user, userID, channelID, message, rawEvent) {
  var cmd = message.toLowerCase().split(" ")[0];

  switch (cmd) {
    case "!come":
    case "!came": {
      joinChannel(user, userID, channelID);
    } break;

    case "!addsong": {
      addSong(message.toLowerCase().split(" ")[1]);
    } break;

    case "!skip": {
      skip(userID);
    } break;

    case "!reset": {
      reset();
    } break;

    case "!stop": {
      stop();
    } break;
  }
});

function addSong(youtubeSong) {
  var url = message.toLowerCase().split(" ")[1];
  if(url.indexOf('youtube') > -1 || url.indexOf('youtu.be') > -1) {
    var youtubeSong = new YoutubeSong(url, user, userID);

    //If url is wrong
    if(youtubeSong == null) return;

    youtubeSong.downloadFile(function (err) {
      if(err) {
        console.log(err);
        sendMessage('@' + youtubeSong.username + ' Impossible to load ' + youtubeSong.url);
      } else {
        queue.push(youtubeSong);
      }
    });
  } else {
    console.log('Empty addsong request : ' + message);
  }
}

//reset the queue
function reset() {
  queue.length = 0
}

//Stop the audio
function stop() {
  stream.stopAudioFile();
}

//Skip if more than 50% of the users type !skip
function skip(userID) {
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

function nextSong() {

  stop();
  queue.shift();
  currentSong = queue[0];
  if(currentSong.isValid) {
    var songPath = DOWNLOAD_DIR + currentSong.id_video + '.mp3';
    audioStream.playAudioFile(path);
    audioStream.once('fileEnd', function() {
      console.log('Audio file ended');
      nextSong();
    });
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

function joinChannel(user, userID, channelID) {
  var voiceChannel = findVoiceChannelIdWhereUserIs(userID);

  if(voiceChannel != null) {
    bot.joinVoiceChannel(voiceChannel, function () {
      bot.getAudioContext({channel: voiceChannel, stereo: true}, function(stream) {
          audioStream = stream;
      });
    });

    sendMessage('@' + user + " YES SIR, I'M COMING!", channelID);
  } else {
    sendMessage('@' + user + " You aren't in a voice channel!", channelID);
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
  setInterval(debug, 5000);
  var ys = new YoutubeSong('https://www.youtube.com/watch?v=CDfOFyXGgJU', 'Okawi', '12345678901234567890');
  console.log(ys);
  if(ys.isValid) {
    ys.downloadSong(function (err) {
      if(err) console.log(err);
      else    console.log('Téléchargement fini');
    });
  }
});
