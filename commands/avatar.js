exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, emojis) => {
    
    //!avatar (@usuario | nada)
    
    try {
        const user = message.mentions.users.first() || message.author;

        const avatarEmbed = new discord.RichEmbed()
            .setColor(0xFFC857)
            .setAuthor('Avatar de @' + user.tag)
            .setTitle('URL del Avatar')
            .setImage(user.displayAvatarURL)
            .setURL(user.displayAvatarURL);
        message.channel.send(avatarEmbed);
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
