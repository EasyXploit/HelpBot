exports.run = async (event, discord, fs, config, keys, bot, resources) => {

    console.log('\n' + new Date() + ' 》' + bot.user.username + ' abandonó la guild: ' + event.name + '\n')
        
    const debuggingChannel = bot.channels.get(config.debuggingChannel);
    const guild = event;
    
    let debuggingEmbed = new discord.RichEmbed()
        .setColor(0xFF8360)
        .setThumbnail(guild.iconURL)
        .setTimestamp()
        .setAuthor(bot.user.username + ' abandonó una guild', bot.user.displayAvatarURL)
        .addField('Nombre', guild.name, true)
        .addField('ID', guild.id, true)
        
    await debuggingChannel.send(debuggingEmbed);
}
