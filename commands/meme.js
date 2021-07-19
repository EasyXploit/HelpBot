exports.run = async (discord, client, message, args, command, supervisorsRole, noPrivilegesEmbed) => {
    
    //!meme
    
    try {
        const meme = require("discord-memes");
        message.channel.send(meme.deTodoEspañol())
        require('../utils/errorHandler.js').run(discord, client, message, args, command, e);
    } catch (error) {
    };
};
