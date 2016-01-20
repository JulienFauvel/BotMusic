'use strict';

var DiscordClient = require('discord.io');
var auth = require('../auth.json');

var bot = new DiscordClient({
  autorun: true,
  email: auth.email,
  password: auth.password
})

var currentSong = null;
var queue = Array();

bot.on('ready', function(rawEvent) {
  console.log(bot.username + " connected (" + bot.id + ")");
});

bot.on('message', function(user, userID, channelID, message, rawEvent) {
  var cmd = message.toLowerCase().split(" ")[0];
  console.log(message);
  console.log(cmd);
  switch (cmd) {
    case "!come":
    case "!came": {
      joinChannel(user, userID, channelID);
    } break;
  }
});


function joinChannel(user, userID, channelID) {

  console.log('userID = ' + userID);

  var voiceChannel = null;

  for(var s in bot.servers) {
    for(var uID in bot.servers[s].members) {
      if(uID == userID) {
        voiceChannel = bot.servers[s].members[uID].voice_channel_id;
      }
    }
  }

  if(voiceChannel != null) {
    bot.joinVoiceChannel(voiceChannel, function () {
      bot.getAudioContext({ channel: voiceChannel, stereo: true}, function(stream) {
          stream.playAudioFile('test.mp3'); //To start playing an audio file, will stop when it's done.


          //stream.stopAudioFile(); //To stop an already playing file
          // stream.once('fileEnd', function() {
          //     //Do something now that file is done playing. This event only works for files.
          // });
          // // OR
          // stream.send(rawPCMBuffer) //Piping a stream that the backend can execute the method .read(1920) on.
          //
          // //Experimental
          // stream.on('incoming', function(ssrc,buffer) {
          //     //Handle a buffer of PCM data.
          // });
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
