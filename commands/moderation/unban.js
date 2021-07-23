exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!unban (id) (motivo)
    
    try {

        let notToUnbanEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} Miembro no encontrado. Debes escribir el ID del miembro a desbanear`);

        let noReasonEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar un motivo`);

        if (!args[0]) return message.channel.send(notToUnbanEmbed);

        //Esto comprueba si se ha mencionado a un miembro o se ha proporcionado su ID
        const user = await client.functions.fetchUser(args[0]);
        if (!user) return message.channel.send(notToUnbanEmbed);

        let toDeleteCount = command.length - 2 + args[0].length + 2;

        //Esto comprueba si se debe proporcionar razón
        let reason = message.content.slice(toDeleteCount)
        if (!reason && message.author.id !== message.guild.ownerID) return message.channel.send(noReasonEmbed);
        if (!reason) reason = `Indefinida`;

        await message.guild.members.unban(user.id);
        
        if (client.bans.hasOwnProperty(user.id)) {
            await delete client.bans[user.id];
            await client.fs.writeFile(`./databases/bans.json`, JSON.stringify(client.bans), async err => {
                if (err) throw err;
            });
        };

        let successEmbed = new discord.MessageEmbed()
            .setColor(client.colors.green2)
            .setTitle(`${client.customEmojis.greenTick} Operación completada`)
            .setDescription(`El miembro ${user.tag} ha sido desbaneado`);

        let loggingEmbed = new discord.MessageEmbed()
            .setColor(client.colors.green)
            .setAuthor(`${user.tag} ha sido DESBANEADO`, user.displayAvatarURL({dynamic: true}))
            .addField(`Usuario`, user.tag, true)
            .addField(`Moderador`, message.author.tag, true)
            .addField(`Razón`, reason, true)

        await client.functions.loggingManager(loggingEmbed);
        await message.channel.send(successEmbed);
    } catch (error) {
        if (error.toString().includes(`Unknown Ban`)) {
            let notBannedEmbed = new discord.MessageEmbed()
                .setColor(client.colors.red2)
                .setDescription(`${client.customEmojis.redTick} Este miembro no ha sido baneado`);
            message.channel.send(notBannedEmbed);
        } else {
            await client.functions.commandErrorHandler(error, message, command, args);
        };
    };
};

module.exports.config = {
    name: 'unban',
    aliases: []
};
