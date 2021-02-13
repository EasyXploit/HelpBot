exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //-unban (id) (motivo)
    
    try {
        if (message.author.id !== config.botOwner && !message.member.roles.cache.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);

        let notToUnbanEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Miembro no encontrado. Debes escribir el ID del miembro a desbanear`);

        let noReasonEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes proporcionar un motivo`);

        if (!args[0]) return message.channel.send(notToUnbanEmbed);

        //Esto comprueba si se ha mencionado a un usuario o se ha proporcionado su ID
        const user = await resources.fetchUser(args[0]);
        if (!user) return message.channel.send(notToUnbanEmbed);

        let toDeleteCount = command.length - 2 + args[0].length + 2;

        //Esto comprueba si se debe proporcionar razón
        let reason = message.content.slice(toDeleteCount)
        if (!reason && message.author.id !== message.guild.ownerID) return message.channel.send(noReasonEmbed);
        if (!reason) reason = `Indefinida`;

        await message.guild.members.unban(user.id);
        
        if (client.bans.hasOwnProperty(user.id)) {
            await delete client.bans[user.id];
            await fs.writeFile(`./storage/bans.json`, JSON.stringify(client.bans), async err => {
                if (err) throw err;
            });
        };

        let successEmbed = new discord.MessageEmbed()
            .setColor(resources.green2)
            .setTitle(`${resources.GreenTick} Operación completada`)
            .setDescription(`El usuario ${user.tag} ha sido desbaneado`);

        let loggingEmbed = new discord.MessageEmbed()
            .setColor(resources.green)
            .setAuthor(`${user.tag} ha sido DESBANEADO`, user.displayAvatarURL())
            .addField(`Usuario`, user.tag, true)
            .addField(`Moderador`, message.author.tag, true)
            .addField(`Razón`, reason, true)

        await message.delete();
        await loggingChannel.send(loggingEmbed);
        await message.channel.send(successEmbed);
    } catch (e) {
        if (e.toString().includes(`Unknown Ban`)) {
            let notBannedEmbed = new discord.MessageEmbed()
                .setColor(resources.red2)
                .setDescription(`${resources.RedTick} Este usuario no ha sido baneado`);
            message.channel.send(notBannedEmbed);
        } else {
            require('../../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
        }
    }
}
