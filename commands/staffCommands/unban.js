exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //-unban (id) (motivo)
    
    try {
        if (message.author.id !== config.botOwner && !message.member.roles.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);

        let notToUnbanEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Debes escribir el id del miembro a desbanear');

        let noReasonEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Debes proporcionar un motivo');

        //Esto comprueba si se ha mencionado a un usuario o se ha proporcionado su ID
        let user = await message.mentions.users.first() || await bot.fetchUser(args[0]);
        if (!user) return message.channel.send(notToBanEmbed);

        let toDeleteCount = command.length - 2 + args[0].length + 2;

        //Esto comprueba si se ha proporcionado razón
        let reason = message.content.slice(toDeleteCount)
        if (!reason) return message.channel.send(noReasonEmbed);

        await message.guild.unban(user.id);
        
        if (bot.bans.hasOwnProperty(user.id)) {
            await delete bot.bans[user.id];
            await fs.writeFile('./bans.json', JSON.stringify(bot.bans), async err => {
                if (err) throw err;
            });
        };

        let successEmbed = new discord.RichEmbed()
            .setColor(0xB8E986)
            .setTitle(resources.GreenTick + ' Operación completada')
            .setDescription('El usuario ' + user.tag + ' ha sido desbaneado');

        let loggingEmbed = new discord.RichEmbed()
            .setColor(0x3EB57B)
            .setAuthor(user.tag + ' ha sido DESBANEADO', user.displayAvatarURL)
            .addField('Usuario', '@' + user.tag, true)
            .addField('Moderador', '<@' + message.author.id + '>', true)
            .addField('Razón', reason, true)

        await loggingChannel.send(loggingEmbed);
        await message.channel.send(successEmbed);
    } catch (e) {
        if (e.toString().includes('Unknown Ban')) {
            let notBannedEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .setDescription(resources.RedTick + ' Este usuario no ha sido baneado');
            message.channel.send(notBannedEmbed);
        } else if (e.toString().includes('Invalid Form Body')) {
            let notBannedEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .setDescription(resources.RedTick + ' Si el usuario no está en el servidor, has de especificar su ID');
            message.channel.send(notBannedEmbed);
        }  else if (e.toString().includes('Unknown User')) {
            let notBannedEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .setDescription(resources.RedTick + ' El ID proporcionado no es válido');
            message.channel.send(notBannedEmbed);
        } else {
            let handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
        }
    }
}
