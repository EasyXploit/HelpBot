exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //-spawn (url)
    
    try {
        const url = message.content.slice(7);
        
        let noCorrectSyntaxEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Debes escribir la URL de la imagen a Spawnear');
            
        if (url.length < 1) return message.channel.send(noCorrectSyntaxEmbed);

        message.delete();
        
        const avatar = "https://cdn.discordapp.com/avatars/365975655608745985/a6cfb55514ce22cd720d37d1c572a5e7.png?";
        
        let resultEmbed = new discord.RichEmbed()
            .setColor(0x00AF85)
            .setTitle('A wild pokémon has appeared!')
            .setDescription('Guess the pokémon and type p!catch <pokémon> to catch it!')
            .setImage(url);
        
        message.channel.fetchWebhooks().then(webhook => {
            let foundWebhook = webhook.find(w => w.name === 'Pokécord')
            
            if (!foundWebhook) {
                message.channel.createWebhook('Pokécord', avatar).then(webhook => {
                    webhook.send(resultEmbed);
                })
            } else {
                foundWebhook.send(resultEmbed);
            }
        })
    } catch (e) {
        require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
