exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //-banear (@usuario | id) (motivo)
    
    try {
        if (message.author.id !== config.botOwner && !message.member.roles.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);
        
        let notToBanEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Debes mencionar a un usuario o escribir su id');

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
        let user = await message.mentions.users.first() || await bot.fetchUser(args[0]);
        if (!user) return message.channel.send(notToBanEmbed);
        
        if (user.bot) return message.channel.send(noBotsEmbed);
        
        let author = message.guild.member(message.author.id)
        
        let member = message.guild.members.get(user.id);
        if (member) {
            //Se comprueba si puede banear al usuario
            if (author.id !== message.guild.owner.id) {
                if (author.highestRole.position <= member.highestRole.position) return message.channel.send(noPrivilegesEmbed)
            }
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

        let successEmbed = new discord.RichEmbed()
            .setColor(0xB8E986)
            .setTitle(resources.GreenTick + ' Operación completada')
            .setDescription('El usuario <@' + user.id + '> ha sido baneado, ¿alguien más? ' + resources.drakeban);

        let loggingEmbed = new discord.RichEmbed()
            .setColor(0xEF494B)
            .setAuthor(user.tag + ' ha sido BANEADO', user.displayAvatarURL)
            .addField('Miembro', '<@' + user.id + '>', true)
            .addField('Moderador', '<@' + message.author.id + '>', true)
            .addField('Razón', reason, true)
            .addField('Duración', '∞', true);

        let toDMEmbed = new discord.RichEmbed()
            .setColor(0xEF494B)
            .setAuthor('[BANEADO]', message.guild.iconURL)
            .setDescription('<@' + user.id + '>, has sido baneado en ' + message.guild.name)
            .addField('Moderador', '@' + message.author.tag, true)
            .addField('Razón', reason, true)
            .addField('Duración', '∞', true);

        if (member) {
            await user.send(toDMEmbed);
        }
        await message.guild.ban(user, {reason: reason});
        await loggingChannel.send(loggingEmbed);
        await message.channel.send(successEmbed);
    } catch (e) {
        if (e.toString().includes('Invalid Form Body')) {
            let notToBanEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .setDescription(resources.RedTick + ' Si el usuario no está en el servidor, has de especificar su ID');
            message.channel.send(notToBanEmbed);
            console.log(e);
        } else {
            const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
        }
    }
}
