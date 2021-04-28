exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //!meme
    
    try {
        const meme = require("discord-memes");
        message.channel.send(meme.deTodoEspañol())
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    };
};
