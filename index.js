"use strict";

const Discord = require("discord.js");
const fs = require("fs");
const ytdl = require("ytdl-core");
const bot = new Discord.Client();
const settings = require("./settings.js");
let userlist = JSON.parse(fs.readFileSync('./data/userlist.json', 'utf8'));
let queue = [];
let playing = false;
let currentlyPlaying = ""; // global vars for the music bot
let user = [];
let votes = {}; // global vars for the voting system
let dispatcher, userVoice, VoiceConnection; //That's the voice channel the bot is talking in

//Global functions
//Joins the voicechannel of the message author
//Voice connection is asynchronous, takes up to 1000ms
function joinChannel(msg) {
    if (typeof VoiceConnection === 'undefined' || !VoiceConnection) {
        console.log("connecting to channel")
        const userVoiceID = msg.member.voiceChannelID;
        userVoice = msg.guild.channels.get(userVoiceID);
        refreshUser();
        userVoice.join().then(connection => {
            VoiceConnection = connection;
        });
    }
}
//a list of users in the voicechannel
function refreshUser() {
    user = [];
    userVoice.members.array().forEach(function (GuildMember) {
        if (GuildMember.user && !GuildMember.user.bot) {
            user.push(GuildMember.user);
        }
    });
}
//voting function: action acts as id, each vote has a array of client-ids of client that accepted the vote
//if more than 50% of the current clients in the voice channel voted(yes), the function returns true
function vote(msg, voteAction) {
    if (!votes[voteAction]) {
        votes[voteAction] = [msg.author.id];
    } else {
        votes[voteAction].push(msg.author.id);
    }

    if (evaluteVote(msg, voteAction)) {
        votes[voteAction] = [];
        return true;
    } else {
        return false;
    }
}
//checks if vote is now passed
function evaluteVote(msg, voteAction) {
    refreshUser();
    var all = user.length;
    var voted = 0;
    user.forEach(function (currentUser) {
        if (votes[voteAction].indexOf(currentUser.id) > -1) {
            voted += 1;
        }
    });
    msg.channel.sendMessage(voteAction + ": " + voted + " / " + all);
    return ((voted / all) >= 0.5);
}
//Checks the current queue. If no song is playing,  the queue jumpstarts
function checkQueue(msg) {
    if (typeof msg.member.voiceChannelID === "undefined") {
        msg.channel.sendMessage("You're not in a voicechannel! Couldn't join a voice channel.");
    } else {
        if (!playing && queue.length > 0) {
            joinChannel(msg);
            var item = queue.shift();
            setTimeout(function () {
                playFromQueue(msg, item);
            }, 500);
        } else if (!playing && dispatcher) {
            currentlyPlaying = "";
            disconnect(msg);
        }
    }
}
//Adds a song to the queue
function addtoQueue(msg, item) {
    queue.push(item);
    msg.channel.sendMessage(item.name + " was added to queue! Position: " + parseInt(queue.length));
}
//Plays the topmost song in the queue
function playFromQueue(msg, item) {
    if (typeof VoiceConnection !== 'undefined' && VoiceConnection) {
        votes["Skip current Song"] = []; // reset vote skip
        msg.channel.sendMessage("Now Playing: " + item.name);
        currentlyPlaying = item.name;
        setGame(item.name);

        if (item.stream) {
            var readable = ytdl(item.value, {
                'filter': 'audioonly'
            });
            dispatcher = VoiceConnection.playStream(readable);
            dispatcher.passes = 3;
        } else {
            dispatcher = VoiceConnection.playFile(item.value);
            dispatcher.passes = 3;
        }

        dispatcher.on('end', function () {
            playing = false;
            checkQueue(msg);
        });

        /**
        dispatcher.on('error',function(err){
        	console.log("dispatch error: " + err);
        	playing = false;	
        	checkQueue(msg);
        });	
        **/

        playing = true;
    } else {
        setTimeout(function () {
            playFromQueue(msg, item);
            console.log("retry");
        }, 100);
    }
};
//Modifies the bot's game
function setGame(game) {
    if (typeof game === "string") {
        bot.user.setGame(game);
        console.log("Changed Game presence to " + game);
    }
}
//Modifies the bot's status (takes online,idle,dnd,invisible)
function setStatus(status) {
    if (status === "online" || status === "idle" || status === "dnd" || status === "invisible") {
        bot.user.setStatus(status);
        console.log("Changed Status to " + status);
    } else {
        console.log("Couldn't change status - invalid value was passed");
    }
}
//Checks if the user who called a command that requires special access has the permissions to do so. Returns true if okay. 
function accessCheck(msg, requiredAccess, punishment) {
    if (!userlist.mods.hasOwnProperty(msg.author.id) || userlist.mods[msg.author.id].access < requiredAccess) {
        if (!punishment === false) { //...if not false (bool) to allow passing the punishment directly
            applyBotBan("<@!" + msg.author.id + ">", punishment);
        }
        msg.channel.sendMessage("Access denied.");
        return false;
    } else {
        return true;
    }
}
//Used to show banned people for how long they are banned.
function bannedFor(expires) {
    if (expires === "never") {
        return "three thousand eternities *(permanent)*";
    } else {
        let time = (expires - new Date()) / 1000;
        if (time > 60) { //more than 60 seconds
            time = Math.ceil(time / 60);
            if (time > 60) { //more than 60 minutes
                time = Math.ceil(time / 60);
                if (time > 24) { //more than 24 hours
                    time = Math.ceil(time / 24);
                    return time + " days";
                }
                return time + " hours";
            } else {
                return time + " minutes";
            }
        } else {
            return time + " seconds";
        }
    }
}
//Applies botbans to users. 
function applyBotBan(mention, time) {
    console.log(mention, time);
    if (mention) {
        if (!mention.startsWith("<@")) {
            return ("You asked me to botban someone, but you didn't provide a valid mention. Did the user leave the Guild?");
        } else {
            let bannedUser = mention.substring(3, mention.length - 1);
            if (userlist.mods.hasOwnProperty(bannedUser) && userlist.mods[bannedUser].access >= settings.ban_immunity) {
                return ("The user you tried to ban is immune!");
            }
            if (!time) {
                time = settings.default_bantime;
            }
            if (time === "never") {
                addBotBan(bannedUser, "never");
                return ("The user with the ID " + bannedUser + " has been permanently botbanned.");
            } else if (time.endsWith("s")) {
                let expirytime = new Date();
                let bantime = Number(time.substring(0, time.length - 1));
                expirytime.setSeconds(expirytime.getSeconds() + bantime);
                addBotBan(bannedUser, expirytime.getTime());
                return ("The user with the ID " + bannedUser + " has been botbanned for " + time);
            } else if (time.endsWith("m")) {
                let expirytime = new Date();
                let bantime = Number(time.substring(0, time.length - 1));
                expirytime.setMinutes(expirytime.getMinutes() + bantime);
                addBotBan(bannedUser, expirytime.getTime());
                return ("The user with the ID " + bannedUser + " has been botbanned for " + time);
            } else if (time.endsWith("h")) {
                let expirytime = new Date();
                let bantime = Number(time.substring(0, time.length - 1));
                expirytime.setHours(expirytime.getHours() + bantime);
                addBotBan(bannedUser, expirytime.getTime());
                return ("The user with the ID " + bannedUser + " has been botbanned for " + time);
            } else if (time.endsWith("d")) {
                let expirytime = new Date();
                let bantime = Number(time.substring(0, time.length - 1));
                expirytime.setDate(expirytime.getDate() + bantime);
                addBotBan(bannedUser, expirytime.getTime());
                return ("The user with the ID " + bannedUser + " has been botbanned for " + time);
            } else {
                return ("You asked me to botban the user with the ID " + bannedUser + " for a specific time, but you didn't provide a valid time.");
            }
        }
    } else {
        return ("You asked me to botban someone, but you didn't provide a mention.");
    }
}
//Used in applyBotBan to check if the user is already botbanned. If not, create new entry. If they are, update expiry date.
function addBotBan(id, expirytime) {
    if (!userlist.banned.hasOwnProperty(id)) {
        userlist.banned[id] = {};
    }
    userlist.banned[id].expires = expirytime;
    userlist.banned[id].id = Number(id);
    fs.writeFile('./data/userlist.json', JSON.stringify(userlist,"  ","  "));
    if (settings.useDiscordRoles) {
        if (!settings.botbanned_role_id) {
            msg.channel.sendMessage("You didn't set up a botbanned role!");
        } else {
            //Do shit to assign a role
        }
    }
}
//##########################
//####     COMMANDS     ####
//##########################
// Ends the current dispatcher to jump to the next song
const nextSong = function (msg) {
    if (vote(msg, "Skip current Song")) {
        dispatcher.end();
        setGame(settings.default_game);
    }
};
// Runs nextSong and clears queue.
const flushQueue = function (msg) {
    queue = [];
    if (playing) {
        dispatcher.end();
    }
    setGame(settings.default_game);
};
//Lists current queue.
const infoQueue = function (msg) {
    if (queue.length > 0) {
        var msgString = "Currently in Queue: \n";
        var i = 1;
        var item;

        msgString += "0: " + currentlyPlaying + "\n";

        queue.forEach(function (item) {
            msgString += i + ": " + item["name"] + "\n";
            i += 1;
        });
    } else if (playing) {
        nowPlaying(msg);
    } else {
        var msgString = "There aren´t any items in the queue right now.";
    }

    msg.channel.sendMessage(msgString);
}
//Debug
const debug = function (msg) {
    msg.channel.sendCode("js", "//Debug function executed");
    console.log(userlist);
};
//Ping, Pong!
const ping = function (msg) {
    msg.channel.sendMessage("Pong!");
};
//Stop the current node.js process with an exit message - if called by the bot owner, only. 
const terminate = function (msg) {
    if (accessCheck(msg, 99, false)) {
        disconnect(msg);
        msg.channel.sendMessage("Niklas, no! I will not smash the sun! *shattering sound*");
        setTimeout(process.exit, 1000);
    } else {
        msg.channel.sendMessage(msg.author.username + ", no! I will not smash the sun!");
    }

};
//Music and predefined files
const play = function (msg) {
    var call = msg.content.substring(settings.prefix.length);
    call = call.split(" ");
    if (call[1]) {
        var file = files[call[1]];
        if (call[1].toLowerCase() in files) {
            var item = {
                "name": call[1],
                "stream": false,
                "value": "./sounds/" + files[call[1]]
            };
            addtoQueue(msg, item);
            checkQueue(msg);
        } else if (call[1].startsWith("https://youtu.be") || call[1].startsWith("https://www.youtube.com")) {
            msg.channel.sendMessage("Grabbing metadata...");
            var ytInfo = ytdl.getInfo(call[1], {
                filter: "audioonly"
            }, function (err, info) {
                if (!err) {
                    var item = {
                        "name": info["title"],
                        "stream": true,
                        "value": call[1]
                    };
                    addtoQueue(msg, item);
                    checkQueue(msg);
                } else {
                    msg.channel.sendMessage("Stream not found!");
                    console.log(err);
                }
            });
        } else {
            msg.channel.sendMessage("File/Meme not found");
        }
    } else {
        msg.channel.sendMessage("**REEEEEE**, it's `" + settings.prefix + "play [filename/link]`");
    }
};
//says song that is currently playing
const nowPlaying = function (msg) {
    if (currentlyPlaying != "") {
        msg.channel.send("Currently Playing: " + currentlyPlaying);
    } else {
        msg.channel.send("Not playing anything right now.");
    }
}
//Disconnect the bot from the voice channel.
const disconnect = function (msg) {
    if (dispatcher) {
        dispatcher.end("Halted by user");
        flushQueue(msg);
        userVoice.leave();
        msg.channel.send("Left voice channel.");
        dispatcher = null;
        VoiceConnection = null;
        setGame(settings.default_game);
    } else {
        msg.channel.send("Not in a voice channel!");
    }
}
//Change volume of the bot
const volume = function (msg) {
    var call = msg.content.substring(settings.prefix.length);
    call = call.split(" ");
    if (!call[1] && dispatcher) {
        msg.channel.sendMessage("The current volume is " + dispatcher.volume);
    } else if (!dispatcher) {
        msg.channel.sendMessage("Sound Dispatcher is offline.");
    } else {
        if (call[1] >= 0 && call[1] <= 2) {
            dispatcher.setVolume(call[1]);
            msg.channel.sendMessage("Volume has been set to " + call[1]);
        } else {
            msg.channel.sendMessage("Error! Volume can only be set between 0 and 2. Your value " + call[1] + " is out of bounds!");
        }
    }
}
//Used to play the stream/file
const sound_play = function (msg, type, src) {
    if (dispatcher) {
        dispatcher.end("Halted due to two audio files playing at the same time");
    }
    const userVoiceID = msg.member.voiceChannelID;
    userVoice = msg.guild.channels.get(userVoiceID);
    userVoice.join().then(connection => {
        if (type === "file") {
            dispatcher = connection.playFile('./sounds/' + src);
        } else if (type === "stream") {
            dispatcher = connection.playStream(src);
        } else {
            console.log("What the fuck, man?");
        }
        dispatcher.on('speaking', (event, listener) => {
            if (!event) {
                userVoice.leave();
                dispatcher = null;
                setGame(settings.default_game);
            }
        });
    });
};
//Return information about the user
const userinfo = function (msg) {
    let reply = new Discord.RichEmbed();
    console.log(msg.member);
    reply.addField("User ID", msg.author.id);
    reply.addField("Account age", Math.floor(((new Date() - msg.author.createdAt) / 86400000)) + " days ago" + " | " + msg.author.createdAt);
    reply.addField("Avatar", msg.author.avatarURL);
    reply.setColor(msg.member.highestRole.color);
    reply.setImage(msg.author.avatarURL);
    reply.timestamp = new Date();
    reply.setAuthor("Solstice User Info | " + msg.author.username + "#" + msg.author.discriminator, bot.user.avatarURL);
    msg.channel.sendEmbed(reply);
};
//For the loods
const fuck = function (msg) {
    msg.channel.sendMessage("Wow, no, you l00d.");
};
//lots of kappa
const memes = function (msg) {
    const memepages = [
        "https://www.reddit.com/r/kreiswichs/",
        "https://www.reddit.com/r/nottheonion/",
        "https://www.reddit.com/r/showerthoughts/",
        "https://www.reddit.com/r/GlobalOffensive/",
        "https://www.reddit.com/r/Overwatch/",
        "https://www.reddit.com/r/iamverysmart/",
        "https://www.youtube.com/watch?v=yXXyfeWJz1M"
    ];
    msg.channel.sendMessage(memepages[Math.floor(Math.random() * memepages.length)] + " ( ͡° ͜ʖ ͡°)");
};
//volvo pls fix
const fix = function (msg) {
    msg.channel.sendMessage("volvo, pls fix http://starecat.com/content/wp-content/uploads/engineer-engifar-engiwherever-you-are-titanic.jpg");
};
//we'll bang okay
const bang = function (msg) {
    msg.channel.sendMessage("We'll bang, okay? :gun:");
};
//Botbans users, and adds entries to the JSON file.
const botban = function (msg) {
    if (accessCheck(msg, 5, "15m")) {
        var call = msg.content.substring(settings.prefix.length);
        call = call.split(" ");
        call.shift();
        msg.channel.sendMessage(applyBotBan(call[0], call[1]));
    }
};
const commands = {
    help: {
        function: help,
        access: 0,
        punishment: false,
        hidden: false,
        help_text: "Show commands & indepth help",
        help_indepth: "Pass it a command name, and you shall recieve!",
        help_args: "[command]",
        help_aliases: false,
    },
    debug: {
        function: debug,
        access: 5,
        punishment: false,
        hidden: false,
        help_text: "Runs the debug function",
        help_indepth: "I can't go against my programming. This will run whatever is in debug.",
        help_args: "No args specified",
        help_aliases: false,
    },
    ping: {
        function: ping,
        access: 0,
        punishment: false,
        hidden: false,
        help_text: "Pong!",
        help_indepth: "Ping, pong, and on, and on",
        help_args: false,
        help_aliases: false,
    },
    memes: {
        function: memes,
        access: 0,
        punishment: false,
        hidden: false,
        help_text: "Returns a random meme",
        help_indepth: "We Are Number One but it's actually the nutshack",
        help_args: false,
        help_aliases: false,
    },
    play: {
        function: play,
        access: 0,
        punishment: false,
        hidden: false,
        help_text: "Adds songs to the queue",
        help_indepth: "Adds either predefined local files or valid YouTube links to the music bot queue.",
        help_args: "[name or url]",
        help_aliases: "music",
    },
    music: {
        function: play,
        access: 0,
        punishment: false,
        hidden: true,
        help_text: "Adds songs to the queue",
        help_indepth: "Adds either predefined local files or valid YouTube links to the music bot queue.",
        help_args: "[name or url]",
        help_aliases: "play",
    }, 
    skip: {
        function: nextSong,
        access: 0,
        punishment: false,
        hidden: false,
        help_text: "Voteskip the current song",
        help_indepth: "Adds your vote to voteskip the current song. If 50% or more of the VC attendants vote to skip, the next song plays.",
        help_args: false,
        help_aliases: "next",
    },
    next: {
        function: nextSong,
        access: 0,
        punishment: false,
        hidden: true,
        help_text: "Voteskip the current song",
        help_indepth: "Adds your vote to voteskip the current song. If 50% or more of the VC attendants vote to skip, the next song plays.",
        help_args: false,
        help_aliases: "skip",
    },
    clear: {
        function: flushQueue,
        access: 2,
        punishment: false,
        hidden: false,
        help_text: "Empties the musicbot queue",
        help_indepth: "Clears out all entries in the current queue and disconnects the bot from any VC.",
        help_args: false,
        help_aliases: "flush",
    }, 
    flush: {
        function: flushQueue,
        access: 2,
        punishment: false,
        hidden: true,
        help_text: "Empties the musicbot queue",
        help_indepth: "Clears out all entries in the current queue and disconnects the bot from any VC.",
        help_args: false,
        help_aliases: "clear",
    },
    queue: {
        function: infoQueue,
        access: 0,
        punishment: false,
        hidden: false,
        help_text: "Lists the current queue",
        help_indepth: "Lists all current songs in the musicbot",
        help_args: false,
        help_aliases: false,
    },
    np: {
        function: nowPlaying,
        access: 0,
        punishment: false,
        hidden: false,
        help_text: "Shows current song",
        help_indepth: "Returns the song the musicbot is playing right now",
        help_args: false,
        help_aliases: false,
    },
    disconnect: {
        function: disconnect,
        access: 2,
        punishment: false,
        hidden: false,
        help_text: "Disconnect from VC",
        help_indepth: "Disconnects the bot from any voicechannel it's connected to",
        help_args: false,
        help_aliases: "dc",
    },
    dc: {
        function: disconnect,
        access: 2,
        punishment: false,
        hidden: true,
        help_text: "Disconnect from VC",
        help_indepth: "Disconnects the bot from any voicechannel it's connected to",
        help_args: false,
        help_aliases: "disconnect",
    },
    volume: {
        function: volume,
        access: 1,
        punishment: false,
        hidden: false,
        help_text: "Changes musicbot volume",
        help_indepth: "Changes the volume the bot is playing audio with. Warning: Anything above 1.5 will sound distorted!",
        help_args: "[volume (0-2)]",
        help_aliases: "vol",
    },
    vol: {
        function: volume,
        access: 1,
        punishment: false,
        hidden: true,
        help_text: "Changes musicbot volume",
        help_indepth: "Changes the volume the bot is playing audio with. Warning: Anything above 1.5 will sound distorted!",
        help_args: "[volume (0-2)]",
        help_aliases: "volume",
    },
    userinfo: {
        function: userinfo,
        access: 0,
        punishment: false,
        hidden: false,
        help_text: "Shows user info",
        help_indepth: "Shows a few informations about the person calling the command. Info of other users soon:tm:",
        help_args: false,
        help_aliases: false,
    },
    fuck: {
        function: fuck,
        access: 0,
        punishment: false,
        hidden: true,
        help_text: "...",
        help_indepth: "...",
        help_args: false,
        help_aliases: false,
    },
    bang: {
        function: bang,
        access: 0,
        punishment: false,
        hidden: true,
        help_text: "We'll bang, okay?",
        help_indepth: "We'll bang, okay?",
        help_args: false,
        help_aliases: false,
    },
    fix: {
        function: fix,
        access: 0,
        punishment: false,
        hidden: true,
        help_text: "volvo, pls fix",
        help_indepth: "volvo, pls fix",
        help_args: false,
        help_aliases: false,
    },
    botban: {
        function: botban,
        access: 5,
        punishment: "15m",
        hidden: false,
        help_text: "Bans a user from using the bot.",
        help_indepth: "Bans a mentioned user for a specified time. Set the time to 'never' and the ban will be permanent.",
        help_args: "[@mention] [time in letter notation (30m)]",
        help_aliases: false,
    },
    terminate: {
        function: terminate,
        access: 99,
        punishment: "30m",
        hidden: false,
        help_text: "Stops the bot.",
        help_indepth: "Closes the node process after returning a goodbye message.",
        help_args: false,
        help_aliases: "break,die,smash",
    },
    break: {
        function: terminate,
        access: 99,
        punishment: "30m",
        hidden: true,
        help_text: "Stops the bot.",
        help_indepth: "Closes the node process after returning a goodbye message.",
        help_args: false,
        help_aliases: "die,smash,terminate",
    },
    die: {
        function: terminate,
        access: 99,
        punishment: "30m",
        hidden: true,
        help_text: "Stops the bot.",
        help_indepth: "Closes the node process after returning a goodbye message.",
        help_args: false,
        help_aliases: "break,smash,terminate",
    },
    smash: {
        function: terminate,
        access: 99,
        punishment: "30m",
        hidden: true,
        help_text: "Stops the bot.",
        help_indepth: "Closes the node process after returning a goodbye message.",
        help_args: false,
        help_aliases: "break,die,terminate",
    },
}

const files = {
    cena: "cena.mp3",
    holzbrett: "holzbrett.mp3",
    lazytown: "lazyboom.mp3",
    drawingdicks: "dicks.mp3",
    sail: "sail.mp3",
    saail: "saail.mp3",
    slowclap: "slowclap.mp3",
    wochenende: "wochenende.mp3",
    neinneinnein: "neinneinnein.mp3",
    bausparvertrag: "bausparvertrag.mp3",
    sailremix: "sailremix.mp3",
    spada_youandi: "spada_youandi.mp3"
};

bot.on("message", msg => {
    if (msg.content.startsWith(settings.prefix) && !msg.author.bot) {
        if (settings.useDiscordRoles && msg.member.roles.has(settings.botbanned_role_id)) {
            if (userlist.banned[msg.author.id] === undefined) {
                if (settings.access_role_id) {
                    msg.channel.sendMessage("<@&" + settings.access_role_id + ">, the user <@" + msg.author.id + "> still has the botbanned role, but does not have a ban entry in the bot logs. Please double-check your records, and use `" + settings.prefix + "botban (time)`.");
                } else {
                    msg.channel.sendMessage("Attention, Mods! The user <@" + msg.author.id + "> still has the botbanned role, but does not have a ban entry in the bot logs. Please double-check your records, and use `" + settings.prefix + "botban (time)`.");
                }
                return;
            } else if (userlist.banned[msg.author.id].expires === "never" || userlist.banned[msg.author.id].expires > new Date()) {
                msg.channel.sendMessage("<@" + msg.author.id + ">, you are botbanned for another " + bannedFor(userlist.banned[msg.author.id].expires));
                console.log(msg.author.username + " attempted to use a command but is banned");
                return;
            }
        } else if (!settings.useDiscordRoles && userlist.banned.hasOwnProperty(msg.author.id)) {
            if (userlist.banned[msg.author.id].expires === "never" || userlist.banned[msg.author.id].expires > new Date()) {
                msg.channel.sendMessage("<@" + msg.author.id + ">, you are botbanned for another " + bannedFor(userlist.banned[msg.author.id].expires));
                console.log(msg.author.username + " attempted to use a command but is banned");
                return;
            }
        }
        var call = msg.content.substring(settings.prefix.length);
        call = call.split(" ");
        if (commands.hasOwnProperty(call[0])) {
            console.log(msg.author.username + " called command: " + call);
            var fn = commands[call[0]].function;
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
    //The following block automatically adds the bot owner to the mods userlist, with an access value of 99. This should always grant an override.
    if (!settings.owner_id) {
        console.log("No owner ID set! Terminate the bot process (hold ctrl+c in your console) and add it.");
    } else {
        if (!userlist.mods.hasOwnProperty(settings.owner_id)) {
            userlist.mods[settings.owner_id] = {};
        }
        userlist.mods[settings.owner_id].access = 99;
        userlist.mods[settings.owner_id].id = Number(settings.owner_id);
        fs.writeFile('./data/userlist.json', JSON.stringify(userlist,"  ","  "));
    }
    setGame(settings.default_game);
});

bot.login(settings.token);