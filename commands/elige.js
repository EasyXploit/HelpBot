exports.run = (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel, emojis) => {
    
    let notToAnswerEmbed = new discord.RichEmbed()
        .setColor(0xF12F49)
        .setDescription('❌ Debes proporcionarme al menos 2 opciones.\nLa sintaxis de este comando es `' + config.prefix + 'elige "opción1" "opción2" ...`');
 
    let options = message.content.slice(8).split('" "');
    let lastOption = options.slice(-1).join();
    
    lastOption = lastOption.substring(0, lastOption.length - 1);
    options.splice(-1);
    options.push(lastOption);
    
    if (!options[0] || !options[1]) return message.channel.send(notToAnswerEmbed);
    
    const texts = ['parece buena opción', 'suena bien', 'parece la opción más viable', ', me decantaré por esta opción', 'es para noobs, osea que la otra'];
    
    const resultEmbed = new discord.RichEmbed()
        .setColor(0x98DBCC)
        .setDescription('🎯 | _"' + options[Math.floor(Math.random() * options.length)] + '"_ ' + texts[Math.floor(Math.random() * texts.length)] + ' ' + message.member.displayName);
    
    message.channel.send(resultEmbed);
}
