const nowPlaying = require("./nowPlaying");

module.exports = function (bot, msg, args, options) {
    let msgString = "peniz";

    if (bot._instance.queue.length > 0) {
        let i = 1;

        msgString = "Currently in Queue: \n";
        msgString += "0: " + bot._instance.currentlyPlaying + "\n";

        bot._instance.queue.forEach(function (item) {
            msgString += i + ": " + item.name + "\n";
            i += 1;
        });
    } else if (bot._instance.playing) {
        nowPlaying(bot, msg, args, options);
    } else {
        msgString = "There aren´t any items in the queue right now.";
    }

    msg.channel.send(msgString);
};