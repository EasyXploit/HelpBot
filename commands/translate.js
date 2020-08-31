exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!translate (idioma orígen) (idioma destino) (texto a traducir)
    
    try {
        const translate = module.require(`translate`);
        const langs = JSON.parse(fs.readFileSync(`./resources/texts/langs.json`, `utf-8`));
        
        let noLanguageEmbed = new discord.MessageEmbed ()
            .setColor(resources.red)
            .setTitle(`${resources.RedTick} Debes proporcionarme un lenguaje al que traducir`)
            .setDescription('La sintaxis de este comando es `' + config.prefix +'translate (fromLang) (toLang) (toTranslate)`');
        
        let notToTranslateEmbed = new discord.MessageEmbed ()
            .setColor(resources.red)
            .setTitle(`${resources.RedTick} Debes proporcionarme un término a traducir`)
            .setDescription('La sintaxis de este comando es `' + config.prefix +'translate (fromLang) (toLang) (toTranslate)`');
        
        let noCorrectCodeEmbed = new discord.MessageEmbed ()
            .setColor(resources.red)
            .setTitle(`${resources.RedTick} Debes proporcionarme un lenguaje al que traducir`)
            .setDescription('Debes introducir \n`' + config.prefix +'translate (fromLang) (toLang) (toTranslate)`');
    
        if (!args[0]) return message.channel.send(noLanguageEmbed);
        if (!args[1]) return message.channel.send(notToTranslateEmbed);
        
        const fromLang = langs[args[0]];
        const toLang = langs[args[1]];
        
        if (!fromLang || !toLang) return message.channel.send(noCorrectCodeEmbed);
        
        const toTranslate = message.content.slice(command.length - 2 + args[0].length + 1 + args[0].length + 2); 
        
        translate(toTranslate, { from: fromLang, to: toLang, engine: 'yandex', key: keys.yandexTranslate }).then(text => {
            message.delete();
            
            let resultEmbed = new discord.MessageEmbed ()
                .setColor(resources.blue)
                .setThumbnail(`https://i.imgur.com/Gg66EoX.png`)
                .setAuthor(`Traductor`, `https://i.imgur.com/Gg66EoX.png`)
                .addField(`De ${fromLang} a ${toLang}:`, text, true)
                .setFooter(`Traducción solicitada por: ${message.member.displayName}`);
            message.channel.send(resultEmbed);
        }).catch((error) => {
            console.log(`${new Date().toLocaleString()} 》Error durante la traducción: ${error}`)
        })
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, bot, message, args, command, e);
    }
}
