//Define commands
const help = require("./../commands/help.js");
const debug = require("./../commands/debug.js");
const ping = require("./../commands/ping.js");
const memes = require("./../commands/memes.js");
const play = require("./../commands/play.js");
const nextSong = require("./../commands/nextSong.js");
const flushQueue = require("./../commands/flushQueue.js");
const infoQueue = require("./../commands/infoQueue.js");
const nowPlaying = require("./../commands/nowPlaying.js");
const disconnect = require("./../commands/disconnect.js");
const volume = require("./../commands/volume.js");
const userinfo = require("./../commands/userinfo.js");
const fuck = require("./../commands/fuck.js");
const bang = require("./../commands/bang.js");
const fix = require("./../commands/fix.js");
const botban = require("./../commands/botban.js");
const terminate = require("./../commands/terminate.js");
const accessRefresh = require("./../commands/accessRefresh.js");
const assignAccess = require("./../commands/assignAccess.js");

module.exports = {
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
        help_args: "[memetype]",
        help_aliases: "meme",
    },
    meme: {
        function: memes,
        access: 0,
        punishment: false,
        hidden: true,
        help_text: "Returns a random meme",
        help_indepth: "We Are Number One but it's actually the nutshack",
        help_args: "[memetype]",
        help_aliases: "memes",
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
        help_indepth: "Shows a few informations about the person calling the command or a mentioned user.",
        help_args: "[@mention]",
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
    accessRefresh: {
        function: accessRefresh,
        access: 10,
        punishment: false,
        hidden: false,
        help_text: "Reloads Role Access Values",
        help_indepth: "Reloads all users that have the predefined roles and assigns them the predefined access values.",
        help_args: false,
        help_aliases: false,
    },
    assignAccess: {
        function: assignAccess,
        access: 10,
        punishment: false,
        hidden: false,
        help_text: "Gives the mentioned user bot access.",
        help_indepth: "The mentioned user will recieve bot access as high as the specified level. Cannot assign a higher access level than the caller has.",
        help_args: "[@mention] [accesslevel]",
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
        help_aliases: "break,die,exterminate,smash",
    },
    break: {
        function: terminate,
        access: 99,
        punishment: "30m",
        hidden: true,
        help_text: "Stops the bot.",
        help_indepth: "Closes the node process after returning a goodbye message.",
        help_args: false,
        help_aliases: "die,exterminate,smash,terminate",
    },
    die: {
        function: terminate,
        access: 99,
        punishment: "30m",
        hidden: true,
        help_text: "Stops the bot.",
        help_indepth: "Closes the node process after returning a goodbye message.",
        help_args: false,
        help_aliases: "break,exterminate,smash,terminate",
    },
    smash: {
        function: terminate,
        access: 99,
        punishment: "30m",
        hidden: true,
        help_text: "Stops the bot.",
        help_indepth: "Closes the node process after returning a goodbye message.",
        help_args: false,
        help_aliases: "break,die,exterminate,terminate",
    },
    exterminate: {
        function: terminate,
        access: 99,
        punishment: "30m",
        hidden: true,
        help_text: "Stops the bot.",
        help_indepth: "Closes the node process after returning a goodbye message.",
        help_args: false,
        help_aliases: "break,die,exterminate,terminate",
    },
};