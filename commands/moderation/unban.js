exports.run = async (client, message, args, command, commandConfig) => {
    
    try {

        let notToUnbanEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Miembro no encontrado. Debes escribir el ID del miembro a desbanear`);

        let noReasonEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar un motivo`);

        if (!args[0]) return message.channel.send({ embeds: [notToUnbanEmbed] });
[]
        //Esto comprueba si se ha mencionado a un miembro o se ha proporcionado su ID
        const user = await client.functions.fetchUser(args[0]);
        if (!user) return message.channel.send({ embeds: [notToUnbanEmbed] });

        let toDeleteCount = command.length - 2 + args[0].length + 2;

        //Esto comprueba si se debe proporcionar razón
        let reason = message.content.slice(toDeleteCount)
        if (!reason && message.author.id !== message.guild.ownerId) return message.channel.send({ embeds: [noReasonEmbed] });
        if (!reason) reason = `Indefinida`;

        await message.guild.members.unban(user.id);
        
        if (client.bans.hasOwnProperty(user.id)) {
            await delete client.bans[user.id];
            await client.fs.writeFile(`./databases/bans.json`, JSON.stringify(client.bans), async err => {
                if (err) throw err;
            });
        };

        let successEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryCorrect)
            .setTitle(`${client.customEmojis.greenTick} Operación completada`)
            .setDescription(`El miembro **${user.tag}** ha sido desbaneado`);

        let loggingEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.correct)
            .setAuthor({ name: `${user.tag} ha sido DESBANEADO`, iconURL: user.displayAvatarURL({dynamic: true}) })
            .addField(`Usuario`, user.tag, true)
            .addField(`Moderador`, message.author.tag, true)
            .addField(`Razón`, reason, true)

        await client.functions.loggingManager(loggingEmbed);
        await message.channel.send({ embeds: [successEmbed] });
    } catch (error) {
        if (error.toString().includes(`Unknown Ban`)) {
            let notBannedEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} Este miembro no ha sido baneado`);
            message.channel.send({ embeds: [notBannedEmbed] });
        } else {
            await client.functions.commandErrorHandler(error, message, command, args);
        };
    };
};

module.exports.config = {
    name: 'unban',
    aliases: []
};
