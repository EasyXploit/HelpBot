exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!urban (término)
    
    try {
        const urban = module.require('urban-dictionary');
        
        let notToSearchEmbed = new discord.MessageEmbed ()
            .setColor(0xF12F49)
            .setTitle(resources.RedTick + ' Debes proporcionarme un término de búsqueda')
            .setDescription('La sintaxis de este comando es `' + config.prefix +'urban (término)`');
    
        if (!args[0]) return message.channel.send(notToSearchEmbed);
        
        const searchTerm = args.join(` `);
        
        urban.term(searchTerm).then((result) => {
            const data = result.entries;
            
            const resultEmbed = new discord.MessageEmbed ()
                .setColor(0x1D2339)
                .setThumbnail(`https://i.imgur.com/ftJ1lnP.png`)
                .setTitle(`📔 | Definición de: __${data[0].word.toUpperCase()}__`)
                .setDescription(data[0].definition)
                .addField(`Valoraciones`, `Likes: ${data[0].thumbs_up} | Dislikes: ${data[0].thumbs_down}`, true)
                .setFooter(`Escrito por: ${data[0].author}`);
            message.channel.send(resultEmbed);
        }).catch((error) => {
            let noDataEmbed = new discord.MessageEmbed ()
                .setColor(0xF12F49)
                .setDescription(resources.RedTick + ' No se ha encontrado ningún resultado que coincida con `' + searchTerm + '`');
            
            if (error.toString().includes(`is undefined`)) {
                message.channel.send(noDataEmbed);
            }
        })
    } catch (e) {
        require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
