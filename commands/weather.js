exports.run = (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!weather (ubicación)
    
    try {
        const weather = module.require('weather-js');
        
        let notToSearchEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setTitle(`${resources.RedTick} Debes proporcionarme un término de búsqueda`)
            .setDescription(`La sintaxis de este comando es \`${config.prefix}weather (ubicación)\``);
    
        if (!args[0]) return message.channel.send(notToSearchEmbed);
        
        const searchTerm = args.join(` `);
        
        weather.find({search: searchTerm, degreeType: 'C'}, function(err, result) {
            if(err) console.log(`${new Date().toLocaleString()} 》${err}`);
            
            const current = result[0].current;
            const location = result[0].location;
            
            const resultEmbed = new discord.MessageEmbed()
                .setColor(0x93BEDF)
                .setThumbnail(current.imageUrl)
                .setTitle(`🌦 | El tiempo en __${current.observationpoint}__`)
                .setDescription(`Tipo de tiempo: **${current.skytext}**`)
                .addField(`🌡 Temperatura`, `${current.temperature}º${location.degreetype}`, true)
                .addField(`❄ Sensación térmica`, `${current.feelslike}º${location.degreetype}`, true)
                .addField(`🌀 Viento`, current.winddisplay, true)
                .addField(`💧 Humedad`, `${current.humidity}%`, true);
            message.channel.send(resultEmbed);
        });
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}
