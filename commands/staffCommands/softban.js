exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {

    //-softban (@usuario | id) (motivo)
    
    try {
        if (message.author.id !== config.botOwner && !message.member.roles.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);
        
        let notToBanEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Debes mencionar a un miembro o escribir su id');
            
        let noReasonEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Debes proporcionar un motivo');
            
        let noBotsEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' No puedes banear a un bot');
        
        let alreadyBannedEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Este usuario ya ha sido baneado');
            
        //Esto comprueba si se ha mencionado a un usuario o se ha proporcionado su ID
        let member = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
        if (!member) return message.channel.send(notToBanEmbed);
        
        if (member.bot) return message.channel.send(noBotsEmbed);
        
        let author = message.guild.member(message.author.id)
        
        //Se comprueba si puede banear al usuario
        if (author.id !== message.guild.owner.id) {
            if (author.highestRole.position <= member.highestRole.position) return message.channel.send(noPrivilegesEmbed);
        }
        
        let bans = await message.guild.fetchBans();
        let isBanned;
        
        await bans.forEach( async ban => {
            if(ban.id === user.id) return isBanned = ban.id;
        });
        if (isBanned) return message.channel.send(alreadyBannedEmbed);
        
        let toDeleteCount = command.length - 2 + args[0].length + 2;
        
        //Esto comprueba si se ha proporcionado razón
        let reason = message.content.slice(toDeleteCount)
        if (!reason) return message.channel.send(noReasonEmbed);
        
        let user = member.user;
        let count = 0;
        
        let workingEmbed = new discord.RichEmbed()
            .setColor(0xC6C9C6)
            .setDescription(resources.GrayTick + ' Operación en marcha ...');
        
        await message.channel.send(workingEmbed).then(msg => {msg.delete(1000)});
        
        await message.guild.channels.forEach( async c => {
            if (c.type !== 'text') return;
            c.fetchMessages().then(async m => {
                const userMessages = m.filter(msg => msg.author.id === user.id);
                await c.bulkDelete(userMessages);
                count = count + parseInt(userMessages.array().length);
            });
        });
            
        let loggingEmbed = new discord.RichEmbed()
            .setColor(0xEF494B)
            .setAuthor(member.user.tag + ' ha sido BANEADO', member.user.displayAvatarURL)
            .addField('Miembro', '<@' + member.id + '>', true)
            .addField('Moderador', '<@' + message.author.id + '>', true)
            .addField('Razón', reason, true)
            .addField('Duración', '∞', true)
            .addField('Mensajes eliminados', count, true);
            
        let toDMEmbed = new discord.RichEmbed()
            .setColor(0xEF494B)
            .setAuthor('[BANEADO]', message.guild.iconURL)
            .setDescription('<@' + member.id + '>, has sido baneado en ' + message.guild.name)
            .addField('Moderador', '@' + message.author.tag, true)
            .addField('Razón', reason, true)
            .addField('Duración', '∞', true);
            
        await member.send(toDMEmbed);
        await member.ban(reason);
        await loggingChannel.send(loggingEmbed);
        
        let successDeleteEmbed = new discord.RichEmbed()
            .setColor(0xB8E986)
            .setTitle(resources.GreenTick + ' Operación completada')
            .setDescription('El usuario <@' + member.id + '> ha sido baneado y se han eliminado ' + count + ' mensajes. ¿alguien más?');
            
        message.channel.send(successDeleteEmbed);
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}