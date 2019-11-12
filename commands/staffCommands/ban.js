exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //-ban (@usuario | id) (motivo)
    
    try {
        if (message.author.id !== config.botOwner && !message.member.roles.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);
        
        let notToBanEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Miembro no encontrado. Debes mencionar a un miembro o escribir su ID.\nSi el usuario no está en el servidor, has de especificar su ID`);

        let noReasonEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Debes proporcionar un motivo`);
        
        let alreadyBannedEmbed = new discord.RichEmbed()
            .setColor(resources.red)
            .setDescription(`${resources.RedTick} Este usuario ya ha sido baneado`);
        
        if (!args[0]) return message.channel.send(notToBanEmbed);
        
        //Esto comprueba si se ha mencionado a un usuario o se ha proporcionado su ID
        let user;
        try {
            user = await bot.fetchUser(message.mentions.users.first() || args[0]);
        } catch (e) {
            return message.channel.send(notToBanEmbed);
        }
        
        let moderator = await message.guild.fetchMember(message.author);
        
        let member;
        try {
            member = await message.guild.fetchMember(user);
        } catch (e) {
            //return message.channel.send(notToBanEmbed);
            console.log(`-`);
        }

        if (member) {
            //Se comprueba si puede banear al usuario
            if (moderator.highestRole.position <= member.highestRole.position) return message.channel.send(noPrivilegesEmbed)
        }
        
        let bans = await message.guild.fetchBans();
        let isBanned;
        
        await bans.forEach( async ban => {
            if(ban.id === user.id) return isBanned = ban.id;
        });
        if (isBanned) return message.channel.send(alreadyBannedEmbed);

        let toDeleteCount = command.length - 2 + args[0].length + 2;

        //Esto comprueba si se debe proporcionar razón
        let reason = message.content.slice(toDeleteCount)
        if (!reason && message.author.id !== message.guild.ownerID) return message.channel.send(noReasonEmbed);
        if (!reason) reason = `Indefinida`;

        let successEmbed = new discord.RichEmbed()
            .setColor(resources.green)
            .setTitle(`${resources.GreenTick} Operación completada`)
            .setDescription(`El usuario <@${user.id}> ha sido baneado, ¿alguien más? ${resources.drakeban}`);

        let loggingEmbed = new discord.RichEmbed()
            .setColor(resources.red2)
            .setAuthor(`${user.tag} ha sido BANEADO`, user.displayAvatarURL)
            .addField(`Miembro`, `<@${user.id}>`, true)
            .addField(`Moderador`, `<@${message.author.id}>`, true)
            .addField(`Razón`, reason, true)
            .addField(`Duración`, `∞`, true);

        let toDMEmbed = new discord.RichEmbed()
            .setColor(resources.red2)
            .setAuthor(`[BANEADO]`, message.guild.iconURL)
            .setDescription(`<@${user.id}>, has sido baneado en ${message.guild.name}`)
            .addField(`Moderador`, `@${message.author.tag}`, true)
            .addField(`Razón`, reason, true)
            .addField(`Duración`, `∞`, true);

        if (member) {
            await user.send(toDMEmbed);
        }

        await message.guild.ban(user, {reason: reason});
        await loggingChannel.send(loggingEmbed);
        await message.channel.send(successEmbed);

    } catch (e) {
        require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
