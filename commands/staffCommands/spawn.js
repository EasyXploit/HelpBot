exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //-spawn (url)
    
    try {
        const url = message.content.slice(7);
        
        let noCorrectSyntaxEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Debes escribir la URL de la imagen a Spawnear');
            
        if (url.length < 1) return message.channel.send(noCorrectSyntaxEmbed);

        message.delete();

        let resultEmbed = new discord.RichEmbed()
            .setColor(0x00AF85)
            .setTitle('A wild pokémon has appeared!')
            .setDescription('Guess the pokémon and type p!catch <pokémon> to catch it!')
            .setImage(url);
        message.channel.send(resultEmbed);

        //await message.channel.send('p!catch ' + args[2])

        //.then(message.channel.send('Congratulations '+ message.author.username +'! You caught a level ' + math.random + ' ' + args[2]))
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
