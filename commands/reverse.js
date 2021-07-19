exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!reverse
    
    try {
        let notToAnswerEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} Debes escribir el texto a invertir.\nLa sintaxis de este comando es \`${client.config.guild.prefix}reverse <texto>\``);

        if (!args[0]) return message.channel.send(notToAnswerEmbed);

        let text = args.join(' ').split('').reverse().join('');

        const resultEmbed = new discord.MessageEmbed()
            .setColor(0xA37044)
            .setDescription('📝 | ' + text);
        message.channel.send(resultEmbed);
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    }
}
