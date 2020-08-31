exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!avatar (@usuario | nada)
    
    try {
        let notFoundEmbed = new discord.MessageEmbed ()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Miembro no encontrado. Debes mencionar a un miembro o escribir su ID.`);

        const user = await resources.fetchUser(args[0] || message.author.id);
        if (!user) return message.channel.send(notFoundEmbed);

        const avatarEmbed = new discord.MessageEmbed()
            .setColor(0xFFC857)
            .setAuthor(`Avatar de @${user.tag}`)
            .setTitle('URL del Avatar')
            .setImage(user.displayAvatarURL())
            .setURL(user.displayAvatarURL());
        message.channel.send(avatarEmbed);
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, config, bot, message, args, command, e);
    }
}
