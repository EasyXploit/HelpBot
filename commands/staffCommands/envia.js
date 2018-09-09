exports.run = (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel) => {
    
    const text = message.content.slice(7);
    
        if (text.length > 0) {
            
            message.delete();

            let resultEmbed = new discord.RichEmbed()
                .setColor(0xFFC857)
                .setDescription(text);
            message.channel.send(resultEmbed);
        } else {
            console.log (new Date().toUTCString() + ' 》' + message.author.username + ' no proporcionó suficientes argumentos para ejecutar el comando: ' + message.content + ' en ' + message.guild.name);

            let errorEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .setDescription('❌ ' + message.author.username + ', debes escribir el contenido del mensaje');
            message.channel.send(errorEmbed);
        }
}
