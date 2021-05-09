exports.run = async (discord, fs, client, message, args, command, supervisorsRole, noPrivilegesEmbed) => {
    
    //!meme
    
    try {
        const meme = require("discord-memes");
        message.channel.send(meme.deTodoEspañol())
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, client, message, args, command, e);
    };
};
