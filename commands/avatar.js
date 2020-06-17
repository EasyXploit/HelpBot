exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!avatar (@usuario | nada)
    
    try {
        const user = message.mentions.users.first() || message.author;

        const avatarEmbed = new discord.MessageEmbed()
            .setColor(0xFFC857)
            .setAuthor('Avatar de @' + user.tag)
            .setTitle('URL del Avatar')
            .setImage(user.displayAvatarURL)
            .setURL(user.displayAvatarURL);
        message.channel.send(avatarEmbed);
    } catch (e) {
        require(`../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
