exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!ban (@usuario | id) (motivo)
    
    try {
        
        let notToBanEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} Miembro no encontrado. Debes mencionar a un miembro o escribir su ID.\nSi el usuario no está en el servidor, has de especificar su ID`);

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
        
        //Se comprueba si el usuario ya estaba baneado
        let bans = await message.guild.fetchBans();

        async function checkBans (bans) {
            for (const item of bans) if (item[0] === user.id) return true;
        };

        let banned = await checkBans(bans);
        if (banned) return message.channel.send(alreadyBannedEmbed);

        let toDeleteCount = command.length - 2 + args[0].length + 2;

        //Esto comprueba si se debe proporcionar razón
        let reason = message.content.slice(toDeleteCount)
        if (!reason && message.author.id !== message.guild.ownerID) return message.channel.send(noReasonEmbed);
        if (!reason) reason = `Indefinida`;

        let successEmbed = new discord.MessageEmbed()
            .setColor(client.colors.green2)
            .setTitle(`${client.customEmojis.greenTick} Operación completada`)
            .setDescription(`El usuario ${user.tag} ha sido baneado, ¿alguien más?`);

        let toDMEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setAuthor(`[BANEADO]`, message.guild.iconURL())
            .setDescription(`<@${user.id}>, has sido baneado en ${message.guild.name}`)
            .addField(`Moderador`, message.author.tag, true)
            .addField(`Razón`, reason, true)
            .addField(`Duración`, `∞`, true);

        if (member) await user.send(toDMEmbed);
        await message.guild.members.ban(user, {reason: `Moderador: ${message.author.id}, Razón: ${reason}`});
        await message.channel.send(successEmbed);
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    }
};