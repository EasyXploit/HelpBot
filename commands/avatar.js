exports.run = async (discord, fs, client, message, args, command) => {
    
    //!avatar (@usuario | nada)
    
    try {
        let notFoundEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.emotes.redTick} Miembro no encontrado. Debes mencionar a un miembro o escribir su ID.`);

        const user = await client.functions.fetchUser(args[0] || message.author.id);
        if (!user) return message.channel.send(notFoundEmbed);

        const avatarEmbed = new discord.MessageEmbed()
            .setColor(client.colors.gold)
            .setAuthor(`Avatar de @${user.tag}`)
            .setTitle('URL del Avatar')
            .setImage(user.displayAvatarURL())
            .setURL(user.displayAvatarURL());
        message.channel.send(avatarEmbed);
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, client, message, args, command, e);
    }
}
