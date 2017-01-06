"use strict";

const Discord = require("discord.js");
const bot = new Discord.Client();
const settings = require("./settings.js");

//Debug
const debug = function (msg) {
    const userVoiceID = msg.member.voiceChannelID;
    const userVoice = msg.guild.channels.get(userVoiceID);

    msg.channel.sendMessage("```Debug executed, check console```");
    msg.channel.sendMessage("user is currently in voice channel " + userVoice);
    console.log(userVoice);

    userVoice.join().then(connection => {
        const dispatcher = connection.playFile('./sounds/cena.mp3');

        console.log(dispatcher);
        
        bot.setTimeout(() => {
            userVoice.leave();
        }, 3000);
    });
};
//Ping, Pong!
const ping = function (msg) {
    msg.channel.sendMessage("Pong!");
};
//Stop the current node.js process with an exit message - if called by the bot owner, only. 
const terminate = function (msg) {
    if (msg.author.id === settings.owner_id) {
        msg.channel.sendMessage("...I understand.");
        bot.destroy();
    } else {
        msg.channel.sendMessage("Ha, no, fuck you!");
    }
};
//Play a predefined file (see files object)
const play = function (msg) {
    const files = {
        cena: "cena.mp3",
        holzbrett: "holzbrett.mp3"
    };
    var call = msg.content.substring(settings.prefix.length);
    call = call.split(" ");
    if (call[1]) {
        if (call[1].toLowerCase() in files) {
            let author = msg.author.id;
            console.log(author);
            /*
            for () {
                //Loop through all known voice channels and see if the author id is represented
                if (something === author) {
                    // do some check if the command was called in the same guild (server)
                    //join that m'f voicechannel, play the file, leave the m'f voicechannel
                } else {
                    msg.channel.sendMessage("You are not in a voicechannel, " + msg.author.username);
                }
            }
            */
        } else {
            msg.channel.sendMessage("File/Meme not found.");
        }

    } else {
        msg.channel.sendMessage("**REEEEEEEE**, it's `" + settings.prefix + "play [filename]`");
    }
};
//Return information about the user
const userinfo = function (msg) {
    /*
    var reply = new Discord.RichEmbed();
    reply.color = 0;
    reply.addField(msg.author.username+"#"+msg.author.discriminator);
    msg.channel.sendMessage(reply);
    */
};
//For the loods
const fuck = function (msg) {
    msg.channel.sendMessage("Wow, no, you l00d.");
};
const commands = {
    debug: debug,
    ping: ping,
    play: play,
    userinfo: userinfo,
    fuck: fuck,
    die: terminate,
    terminate: terminate
};

bot.on("message", msg => {
    if (msg.content.startsWith(settings.prefix) && !msg.author.bot) {
        var call = msg.content.substring(settings.prefix.length);
        call = call.split(" ");
        if (call[0] in commands) {
            console.log(msg.author.username + " called command: " + call);
            var fn = commands[call[0]];
            if (typeof fn === 'function') {
                fn(msg);
            } else {
                console.log("couldn't find function");
            }
        } else {
            console.log(msg.author.username + " called an unknown command: " + call);
            msg.channel.sendMessage("Unknown command.");
        }
    }
});

bot.on("ready", () => {
    console.log("Solstice is ready.");
});

bot.login(settings.token);