exports.run = (discord, fs, client, message, args, command) => {
    
    //!translate (idioma orígen) (idioma destino) (texto a traducir)
    
    try {
        const translate = require('@k3rn31p4nic/google-translate-api');
        const langs = JSON.parse(fs.readFileSync(`./resources/data/langs.json`, `utf-8`));
        
        let noLanguageEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setTitle(`${client.emotes.redTick} Debes proporcionarme un lenguaje al que traducir`)
            .setDescription('La sintaxis de este comando es `' + client.config.prefixes.mainPrefix +'translate (fromLang | auto) (toLang) (toTranslate)`');
        
        let notToTranslateEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setTitle(`${client.emotes.redTick} Debes proporcionarme un término a traducir`)
            .setDescription('La sintaxis de este comando es `' + client.config.prefixes.mainPrefix +'translate (fromLang | auto) (toLang) (toTranslate)`');
        
        let noCorrectCodeEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setTitle(`${client.emotes.redTick} Debes proporcionarme un lenguaje al que traducir`)
            .setDescription('Debes introducir \n`' + client.config.prefixes.mainPrefix +'translate (fromLang | auto) (toLang) (toTranslate)`');
    
        if (!args[0]) return message.channel.send(noLanguageEmbed);
        if (!args[1]) return message.channel.send(notToTranslateEmbed);
        
        const fromLang = langs[args[0]];
        const toLang = langs[args[1]];
        
        if (!fromLang || !toLang || args[1] === 'auto') return message.channel.send(noCorrectCodeEmbed);
        
        const toTranslate = args.slice(2).join(' ');
        
        translate(toTranslate, { from: args[0], to: args[1] }).then(res => {
            message.delete();
            
            let resultEmbed = new discord.MessageEmbed()
                .setColor(client.colors.blue)
                .setThumbnail(`https://i.imgur.com/Gg66EoX.png`)
                .setAuthor(`Traductor`, `https://i.imgur.com/Gg66EoX.png`)
                .addField(`De ${fromLang} a ${toLang}:`, res.text, true)
                .setFooter(`Traducción solicitada por: ${message.member.displayName}`);

            message.channel.send(resultEmbed);
          }).catch(error => {
            console.log(`${new Date().toLocaleString()} 》Error durante la traducción: ${error}`)
          });
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, client, message, args, command, e);
    }
}
