'use strict';

var DiscordClient = require('discord.io');
var YoutubeSong = require('./youtubesong');
var auth = require('../auth.json');
var http = require('http');
var fs = require('fs');

var DOWNLOAD_DIR = './musics/';

var audioStream = null;
var currentVoiceChannel = null;
var currentSong = null;
var queue       = Array();
var skipSet     = new Set();

var bot = new DiscordClient({
  autorun: true,
  email: auth.email,
  password: auth.password
});

bot.on('message', function(username, userID, channelID, message, rawEvent) {
  var cmd = message.toLowerCase().split(" ")[0];
  console.log(username + ' : ' + userID + ' - ' + cmd);
  switch (cmd) {

    case "!come": {
      joinChannel(userID, channelID);
    } break;

    case "!addsong": {
      addSong(message.split(" ")[1], username, userID);
    } break;

    case "!skip": {
      skip(userID);
    } break;

    case "!reset": {
        //TODO : Handle permission reset();
    } break;

    case "!start": {
        //TODO : Handle permission start();
    } break;

    case "!stop": {
      //TODO : Handle permission stop();
    } break;

    case "!next": {
      //TODO : Correctly implement vote to skip nextSong();
    } break;
    
    case "!johncena": {
        joinChannel(userID, channelID);
        while(audioStream == null);
        addSong("https://www.youtube.com/watch?v=enMReCEcHiM", username, userID);
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
            console.error(err);
            sendMessage('@' + youtubeSong.username + ' Impossible to load ' + youtubeSong.url);
          } else {
            queue.push(youtubeSong);
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
  stop();
  queue.length = 0
}

//Start the first song in the queue
function start() {
  if(queue.length > 0) {
    currentSong = queue[0];
    if(currentSong && currentSong.isValid) {
      var songPath = DOWNLOAD_DIR + currentSong.id + '.mp3';
      audioStream.playAudioFile(songPath);
      audioStream.once('fileEnd', songEnded);
    }
  } else {
    currentSong = null;
  }

}

function songEnded() {
  console.log("songEnded");
  queue.shift();
  start();
}

//Stop the audio
function stop() {
  audioStream.stopAudioFile();
  currentSong = null;
}

//Start the next song if there is one
function nextSong() {
  console.log("stop");
  stop();
}


//Skip if more than 50% of the users have typed !skip
//TODO: check for user in the same voice channel
function skip(userID) {

  skipSet.add(userID);
  var skipSum = skipSet.size;

  var onlineMembers = 0;
  var serverID = Object.keys(bot.servers)[0]; //Only one server
  for (var memberID in bot.servers[serverID].members) {
    if (bot.servers[serverID].members[memberID].status == 'online') {
      onlineMembers++;
    }
  }

  console.log('onlineMembers = ' + (onlineMembers-1));
  console.log('skipSum : ' + skipSum);
  console.log('(onlineMembers-1 / 2) : ' + (onlineMembers-1 / 2));
  console.log('Condition : ' + (skipSum > (onlineMembers-1 / 2)));
  console.log(skipSet);

  if (skipSum > (onlineMembers-1 / 2)) {
    if (queue.length > 0) {
      nextSong();
    }
    console.log('Skipped song')
    skipSet.clear();
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
  currentVoiceChannel = findVoiceChannelIdWhereUserIs(userID);

  bot.joinVoiceChannel(currentVoiceChannel, function () {
    bot.getAudioContext({channel: currentVoiceChannel, stereo: true}, function(stream) {
        audioStream = stream;
    });
  });
}

function sendMessage(message, channelID) {
  bot.sendMessage({
    to: channelID,
    message: bot.fixMessage(message)
  });
}

function debug() {
  console.log('currentSong : ' + JSON.stringify(currentSong));
  console.log('queue : ' + JSON.stringify(queue));
}


bot.on('ready', function(rawEvent) {
  console.log(bot.username + " connected (" + bot.id + ")");
  //Use for debug
  //setInterval(debug, 5000);
});
