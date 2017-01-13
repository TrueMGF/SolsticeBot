"use strict";

const Discord = require("discord.js");
const bot = new Discord.Client();
const userlist = require('./data/userlist.json');
const settings = require("./settings");
const parseCommands = require("./methods/parseCommands");
const accessCheck = require("./methods/accessCheck");
const giveAccess = require("./methods/giveAccess");
const commands = require("./data/commands");
const setGame = require("./methods/setGame");
const bannedFor = require("./methods/bannedFor");

bot._instance = {
    queue: [],
    playing: false,
    currentlyPlaying: "",
    user: [],
    votes: {},
    dispatcher: null,
    userVoice: null,
    VoiceConnection: null,
};

bot.on("message", msg => {
    if (msg.content.startsWith(settings.prefix) && !msg.author.bot) { //Invoker? Not a bot user?
        if (userlist.banned.hasOwnProperty(msg.author.id)) {
            if (userlist.banned[msg.author.id].expires === "never" || userlist.banned[msg.author.id].expires > new Date()) {
                msg.channel.sendMessage("<@" + msg.author.id + ">, you are botbanned for another " + bannedFor(userlist.banned[msg.author.id].expires));
                console.log(msg.author.username + " attempted to use a command but is banned");

                return;
            }
        }
        let raw = msg.content.substring(settings.prefix.length);
        let call = parseCommands(raw);
        if (commands.hasOwnProperty(call.name)) { //Is this command valid?
            let useraccess;

            if (!userlist.mods.hasOwnProperty(msg.author.id)) {
                useraccess = 0;
            } else {
                useraccess = userlist.mods[msg.author.id].access;
            } //set useraccess
            if (accessCheck(msg, commands[call.name].access, commands[call.name].punishment)) { //Is useraccess equal or greater than commands.command.access?
                console.log(msg.author.username + " called command: " + call.name + " " + call.args.join(",")); //run command
                let fn = commands[call.name].function;

                if (typeof fn === 'function') { //Is the function that executes the command available?
                    let args = call.args;
                    let options = {
                        "access": commands[call.name].access,
                        "useraccess": useraccess,
                        "callname": call.name,
                        "settings": settings,
                    };

                    fn(bot, msg, args, options);
                } else { //Function not found
                    console.log("Fatal error - function not resolvable");
                }
            }
        } else { //User entered unknown command
            console.log(msg.author.username + " called an unknown command: " + call.name);
            msg.channel.sendMessage("Unknown command. `" + settings.prefix + "help`");
        }
    }
});

bot.on("ready", () => {
    console.log("Solstice is ready.");
    //The following block automatically adds the bot owner to the mods userlist, with an access value of 99. This should always grant an override.
    if (!settings.owner_id) {
        console.log("No owner ID set! Terminate the bot process (hold ctrl+c in your console) and add it.");
    } else {
        giveAccess(settings.owner_id, 99, bot, null, null, null);
    }
    
    setGame(bot, settings.default_game);
});

bot.login(settings.token);