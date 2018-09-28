exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, emojis, supervisorsRole, noPrivilegesEmbed) => {
    
    let experimentalEmbed = new discord.RichEmbed()
        .setColor(0xC6C9C6)
        .setDescription(emojis.GrayTick + ' **Función experimental**\nEstá ejecutando una versión inestable del código de esta función, por lo que esta podría sufrir modificaciones o errores antes de su lanzamiento final.');
    message.channel.send(experimentalEmbed);
    
    //-silenciar (@usuario | id) (motivo)
    
    try {
        if (message.author.id !== config.botOwner && !message.member.roles.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);

        let notToMuteEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(emojis.RedTick + ' Debes mencionar a un miembro o escribir su id');

        let noBotsEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(emojis.RedTick + ' No puedes silenciar a un bot');

        //Esto comprueba si se ha mencionado a un usuario o se ha proporcionado su ID
        let member = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
        if (!member) return message.channel.send(notToMuteEmbed);
        
        let author = message.guild.member(message.author.id)
        
        //Se comprueba si puede banear al usuario
        if (author.id !== message.guild.owner.id) {
            if (author.highestRole.position <= member.highestRole.position) return message.channel.send(noPrivilegesEmbed)
        }
        
        let toDeleteCount = command.length - 2 + args[0].length + 2; 
        let reason = message.content.slice(toDeleteCount) || 'Indefinida';

        if (member.bot) return message.channel.send('noBotsEmbed');

        let role = message.guild.roles.find(r => r.name === 'Silenciado');
        if (!role) {
            role = await message.guild.createRole({
                name: 'Silenciado',
                color: '#818386',
                permissions: []
            });
            //await message.guild.setRolePosition(role, message.guild.roles.size - 1);
            message.guild.channels.forEach(async (channel, id) => {
                await channel.overwritePermissions (role, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false,
                    SPEAK: false
                });
            });
        }

        let alreadyMutedEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription(emojis.RedTick + ' Este usuario ya esta silenciado');

        let successEmbed = new discord.RichEmbed()
            .setColor(0xB8E986)
            .setTitle(emojis.GreenTick + ' Operación completada')
            .setDescription('El usuario <@' + member.id + '> ha sido silenciado, ¿alguien más?');

        let loggingEmbed = new discord.RichEmbed()
            .setColor(0xEF494B)
            .setAuthor(member.user.tag + ' ha sido SILENCIADO', member.user.displayAvatarURL)
            .addField('Miembro', '<@' + member.id + '>', true)
            .addField('Moderador', '<@' + message.author.id + '>', true)
            .addField('Razón', reason, true)
            .addField('Duración', '∞', true);

        let toDMEmbed = new discord.RichEmbed()
            .setColor(0xEF494B)
            .setAuthor('[SILENCIADO]', message.guild.iconURL)
            .setDescription('<@' + member.id + '>, has sido silenciado en ' + message.guild.name)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason, true)
            .addField('Duración', '∞', true);

        if (member.roles.has(role.id)) return message.channel.send(alreadyMutedEmbed);

        await member.addRole(role);
        await message.channel.send(successEmbed);
        await loggingChannel.send(loggingEmbed);
        await member.send(toDMEmbed);
    } catch (e) {
        const handler = require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
