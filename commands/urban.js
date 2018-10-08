exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!urban (término)
    
    try {
        const urban = module.require('urban');
        
        let notToSearchEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setTitle(resources.RedTick + ' Debes proporcionarme un término de búsqueda')
            .setDescription('La sintaxis de este comando es `' + config.prefix +'urban (término)`');
    
        if (!args[0]) return message.channel.send(notToSearchEmbed);
        
        let searchTerm = args.join(" ");
        
        urban(searchTerm).first(data => {
            let noDataEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .setDescription(resources.RedTick + ' No se ha encontrado ningún resultado que coincida con `' + searchTerm + '`');
            
            if (!data) return message.channel.send(noDataEmbed);
            
            const resultEmbed = new discord.RichEmbed()
                .setColor(0x1D2339)
                .setThumbnail('https://i.imgur.com/ftJ1lnP.png')
                .setTitle(`📔 | Definición de: __${data.word.toUpperCase()}__`)
                .setDescription(data.definition)
                .addField('👍 Likes', data.thumbs_up, true)
                .addField('👎 Dislikes', data.thumbs_down, true)
                .setFooter(`Escrito por: ${data.author}`);
            message.channel.send(resultEmbed);
        })
    } catch (e) {
        const handler = require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
