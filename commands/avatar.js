exports.run = (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel, emojis) => {
    
    const user = message.mentions.users.first() || message.author;

    const embed = new discord.RichEmbed()
        .setTitle('URL del Avatar')
        .setAuthor('Avatar de @' + user.username)
        .setFooter('© 2018 República Gamer LLC', 'https://i.imgur.com/jvOFaux.png')
        .setColor(0xFFC857)
        .setImage(user.displayAvatarURL)
        .setURL(user.displayAvatarURL);
    message.channel.send(embed);
}
