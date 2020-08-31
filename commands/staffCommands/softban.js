exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //-softban (@usuario | id) (1 - 7) (motivo)
    
    try {
        if (message.author.id !== config.botOwner && !message.member.roles.cache.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);
        
        let notToBanEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Miembro no encontrado. Debes mencionar a un miembro o escribir su ID.\nSi el usuario no está en el servidor, has de especificar su ID`);

        let incorrectTimeEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes proporcionar una cantidad válida de días de mensajes a borrar, entre 1 y 7`);

        let noReasonEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes proporcionar un motivo`);
        
        let alreadyBannedEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Este usuario ya ha sido baneado`);
        
        if (!args[0]) return message.channel.send(notToBanEmbed);
        
        //Esto comprueba si se ha mencionado a un usuario o se ha proporcionado su ID
        const user = await resources.fetchUser(args[0]);
        if (!user) return message.channel.send(notToBanEmbed);
        
        const moderator = await message.guild.members.fetch(message.author);
        const member = await resources.fetchMember(message.guild, user.id);

        if (member) {
            //Se comprueba si puede banear al usuario
            if (moderator.roles.highest.position <= member.roles.highest.position) return message.channel.send(noPrivilegesEmbed)
        }
        
        let bans = await message.guild.fetchBans();
        let isBanned;
        
        await bans.forEach( async ban => {
            if(ban.id === user.id) return isBanned = ban.id;
        });
        if (isBanned) return message.channel.send(alreadyBannedEmbed);

        let days = Math.floor(args[1]);
        if (isNaN(days) || days < 1 || days > 7) return message.channel.send(incorrectTimeEmbed);

        //Esto comprueba si se debe proporcionar razón
        let reason = args.slice(2)
        if (!reason && message.author.id !== message.guild.ownerID) return message.channel.send(noReasonEmbed);
        if (!reason) reason = `Indefinida`;

        let successEmbed = new discord.MessageEmbed()
            .setColor(resources.green)
            .setTitle(`${resources.GreenTick} Operación completada`)
            .setDescription(`El usuario <@${user.id}> ha sido baneado, ¿alguien más? ${resources.drakeban}`);

        let toDMEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setAuthor(`[BANEADO]`, message.guild.iconURL())
            .setDescription(`<@${user.id}>, has sido baneado en ${message.guild.name}`)
            .addField(`Moderador`, `@${message.author.tag}`, true)
            .addField(`Razón`, reason, true)
            .addField(`Días de mensajes borrados`, days, true)
            .addField(`Duración`, `∞`, true);

        if (member) {
            await user.send(toDMEmbed);
        }

        await message.guild.members.ban(user, {days: days, reason: `Moderador: ${message.author.id}, Razón: ${reason}`});
        await message.channel.send(successEmbed);

    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, config, bot, message, args, command, e);
    }
};
