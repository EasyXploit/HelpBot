exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!softban (@usuario | id) (1 - 7) (motivo)
    
    try {
        
        let notToBanEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} Miembro no encontrado. Debes mencionar a un miembro o escribir su ID.\nSi el usuario no está en el servidor, has de especificar su ID`);

        let incorrectTimeEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar una cantidad válida de días de mensajes a borrar, entre 1 y 7`);

        let noReasonEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar un motivo`);
        
        let alreadyBannedEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} Este usuario ya ha sido baneado`);
        
        if (!args[0]) return message.channel.send(notToBanEmbed);
        
        //Esto comprueba si se ha mencionado a un usuario o se ha proporcionado su ID
        const user = await client.functions.fetchUser(args[0]);
        if (!user) return message.channel.send(notToBanEmbed);
        
        const moderator = await client.functions.fetchMember(message.guild, message.author.id);
        const member = await client.functions.fetchMember(message.guild, user.id);

        if (member) {
            //Se comprueba si puede banear al usuario
            if (moderator.roles.highest.position <= member.roles.highest.position) {

                let cannotBanHigherRoleEmbed = new discord.MessageEmbed()
                    .setColor(client.colors.red)
                    .setDescription(`${client.customEmojis.redTick} No puedes banear a un miembro con un rol igual o superior al tuyo`);
    
                return message.channel.send(cannotBanHigherRoleEmbed);
            };
        };
        
        let bans = await message.guild.fetchBans();
        let isBanned;
        
        await bans.forEach( async ban => {
            if(ban.id === user.id) return isBanned = ban.id;
        });
        if (isBanned) return message.channel.send(alreadyBannedEmbed);

        let days = Math.floor(args[1]);
        if (isNaN(days) || days < 1 || days > 7) return message.channel.send(incorrectTimeEmbed);

        //Genera un mensaje de confirmación
        let successEmbed = new discord.MessageEmbed()
            .setColor(client.colors.orange)
            .setDescription(`${client.customEmojis.orangeTick} **${user.tag}** ha sido baneado, ¿alguien más?`);

        //Almacena la razón
        let reason = args.slice(2).join(" ");

        //Si se ha proporcionado razón, la adjunta al mensaje de confirmación
        if (reason) successEmbed.setDescription(`${client.customEmojis.orangeTick} **${member.user.tag}** ha sido baneado debido a **${reason}**, ¿alguien más?`);

        //Esto comprueba si se debe proporcionar razón
        if (!reason && message.author.id !== message.guild.ownerID) return message.channel.send(noReasonEmbed);
        if (!reason) reason = `Indefinida`;

        let toDMEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setAuthor(`[BANEADO]`, message.guild.iconURL({ dynamic: true}))
            .setDescription(`<@${user.id}>, has sido baneado en ${message.guild.name}`)
            .addField(`Moderador`, message.author.tag, true)
            .addField(`Razón`, reason, true)
            .addField(`Días de mensajes borrados`, days, true)
            .addField(`Duración`, `∞`, true);

        if (member) await user.send(toDMEmbed);
        await message.guild.members.ban(user, {days: days, reason: `Moderador: ${message.author.id}, Días de mensajes borrados: ${days}, Razón: ${reason}`});
        await message.channel.send(successEmbed);

    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'softban',
    aliases: []
};
