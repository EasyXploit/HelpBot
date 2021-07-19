exports.run = async (discord, client, message, args, command) => {
    
    //!avatar (@usuario | nada)
    
    try {
        let notFoundEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} Miembro no encontrado. Debes mencionar a un miembro o escribir su ID.`);

        const user = await client.functions.fetchUser(args[0] || message.author.id);
        if (!user) return message.channel.send(notFoundEmbed);

        const avatarEmbed = new discord.MessageEmbed()
            .setColor(client.colors.primary)
            .setAuthor(`Avatar de @${user.tag}`)
            .setTitle('URL del Avatar')
            .setImage(user.displayAvatarURL({ size: 4096, dynamic: true}))
            .setURL(user.displayAvatarURL({dynamic: true}));
        message.channel.send(avatarEmbed);
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    }
}
