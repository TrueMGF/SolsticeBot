//Joins the voicechannel of the message author
//Voice connection is asynchronous, takes up to 1000ms
module.exports = function(bot,msg) {
    if (typeof bot._instance.VoiceConnection === 'undefined' || !bot._instance.VoiceConnection) {
        console.log("connecting to channel");
        const userVoiceID = msg.member.voiceChannelID;
        bot._instance.userVoice = msg.guild.channels.get(userVoiceID);
        const refreshUser = require("./refreshUser");
        refreshUser(bot);
        bot._instance.userVoice.join().then(connection => {
            bot._instance.VoiceConnection = connection;
        });
    }
}