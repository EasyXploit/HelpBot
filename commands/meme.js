exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!meme
    
    try {
        const meme = require("discord-memes");
        message.channel.send(meme.deTodoEspañol())
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};
