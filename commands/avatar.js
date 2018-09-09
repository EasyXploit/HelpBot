exports.run = (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel) => {
    
    const user = message.mentions.users.first() || message.author;

    const embed = new discord.RichEmbed()
        .setTitle('URL del Avatar')
        .setAuthor('Avatar de @' + user.username)
        .setFooter('© 2018 República Gamer LLC', bot.user.avatarURL)
        .setColor(0xFFC857)
        .setImage(user.displayAvatarURL)
        .setURL(user.displayAvatarURL);
    message.channel.send(embed);
}
