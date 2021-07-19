exports.run = (discord, client, message, args, command) => {
    
    //!translate (idioma orígen) (idioma destino) (texto a traducir)
    
    try {
        const translate = require('@k3rn31p4nic/google-translate-api');
        const langs = JSON.parse(client.fs.readFileSync(`./resources/data/langs.json`, `utf-8`));
        
        let noLanguageEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setTitle(`${client.customEmojis.redTick} Debes proporcionarme un lenguaje al que traducir`)
            .setDescription(`La sintaxis de este comando es \`${client.config.guild.prefix}translate (fromLang | auto) (toLang) (toTranslate)\``);
        
        let notToTranslateEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setTitle(`${client.customEmojis.redTick} Debes proporcionarme un término a traducir`)
            .setDescription(`La sintaxis de este comando es \`${client.config.guild.prefix}translate (fromLang | auto) (toLang) (toTranslate)\``);
        
        let noCorrectCodeEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setTitle(`${client.customEmojis.redTick} Debes proporcionarme un lenguaje al que traducir`)
            .setDescription(`Debes introducir \n\`${client.config.guild.prefix}translate (fromLang | auto) (toLang) (toTranslate)\``);
    
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
                .setAuthor('Traductor', 'https://i.imgur.com/Gg66EoX.png')
                .addField(`De ${fromLang} a ${toLang}:`, res.text, true)
                .setFooter(`Traducción solicitada por: ${message.member.tag}`);

            message.channel.send(resultEmbed);
          }).catch(error => {
            console.log(`${new Date().toLocaleString()} 》Error durante la traducción: ${error}`)
          });
        require('../utils/errorHandler.js').run(discord, client, message, args, command, e);
    } catch (error) {
    }
}
