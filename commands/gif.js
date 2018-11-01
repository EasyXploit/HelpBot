exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!gif (término)
    
    try {
        let notToSearchEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setTitle(resources.RedTick + ' Debes proporcionarme un término de búsqueda')
            .setDescription('La sintaxis de este comando es `' + config.prefix +'gif (término)`');
    
        if (!args[0]) return message.channel.send(notToSearchEmbed);
        
        const searchTerm = args.join(` `);
        
        const giphy = require(`giphy-api`) (keys.giphy);
        const randomColor = require('randomcolor');
        
        giphy.search(searchTerm, function(err, results) {
            if(err) console.log(err);
            
            let data = results.data[Math.floor(Math.random() * (results.data.length - 1))];
            
            let noResultEmbed = new discord.RichEmbed()
                .setColor(resources.red)
                .setDescription(resources.RedTick + ' No se ha encontrado ningún resultado que coincida con `' + searchTerm + '`');
            
            if (!data) return message.channel.send(noResultEmbed);
            
            const resultEmbed = new discord.RichEmbed()
                .setColor(randomColor())
                .setAuthor(data.title, `https://i.imgur.com/oVfX8we.gif`)
                .setDescription(`[URL de GIPHY](${data.url})`)
                .setImage(`https://media.giphy.com/media/${data.id}/giphy.gif`)
                .setFooter(`Powered By GIPHY | giphy.com`)
            message.channel.send(resultEmbed);
        });
    } catch (e) {
        const handler = require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
