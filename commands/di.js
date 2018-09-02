exports.run = (discord, fs, config, token, bot, message, args, command) => {
    
    const text = message.content.slice(4);

    if (text.length > 0) {
        message.delete();
        
        let successEmbed = new discord.RichEmbed()
            .setAuthor(message.author.username + ' dijo:', message.author.avatarURL)
            .setColor(0x2E4052)
            .setDescription(text);
        message.channel.send(successEmbed);
    } else {
        console.log (new Date().toUTCString() + ' 》' + message.author.username + ' no proporcionó suficientes argumentos para ejecutar el comando: ' + message.content + ' en ' + message.guild.name);
        
        let errorEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(message.author.username + ', debes escribir el contenido del mensaje');
        message.channel.send(errorEmbed);
    }
}
