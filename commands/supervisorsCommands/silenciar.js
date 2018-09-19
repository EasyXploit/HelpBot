exports.run = async (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel, emojis) => {
    
    //&silenciar (mención/id) (motivo)

    let notToMuteEmbed = new discord.RichEmbed()
        .setColor(0xF12F49)
        .setDescription('❌ Debes mencionar a un miembro o escribir su id');

    //Esto comprueba si se ha mencionado a un usuario o se ha proporcionado su ID
    let member = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
    if (!member) return message.channel.send(notToMuteEmbed);
    let toDeleteCount = command.length - 2 + args[0].length + 2; 
    let reason = message.content.slice(toDeleteCount) || 'Indefinida'

    let role = message.guild.roles.find(r => r.name === 'Silenciado');
    if (!role) {
        try {
            role = await message.guild.createRole({
                name: 'Silenciado',
                color: '#818386',
                permissions: []
            });
            message.guild.channels.forEach(async (channel, id) => {
                await channel.overwritePermissions (role, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false,
                    SPEAK: false
                });
            });
        } catch (e) {
            console.error(new Date().toUTCString() + ' 》' + e);
            let errorEmbed = new discord.RichEmbed()
                .setColor(0xF12F49)
                .setTitle('❌ Ocurrió un error')
                .addField('Se declaró el siguiente error durante la creación del rol:', e, true);
            message.channel.send(errorEmbed);
        }
    }

    let alreadyMutedEmbed = new discord.RichEmbed()
        .setColor(0xF12F49)
        .setDescription('❌ Este usuario ya esta silenciado');

    let successEmbed = new discord.RichEmbed()
        .setColor(0xB8E986)
        .setTitle('✅ Operación completada')
        .setDescription('El usuario <@' + member.id + '> ha sido silenciado, ¿alguien más?');
    
    let loggingEmbed = new discord.RichEmbed()
        .setColor(0xEF494B)
        .setAuthor(member.user.tag + ' ha sido SILENCIADO', member.user.displayAvatarURL)
        .addField('Miembro', '<@' + member.id + '>', true)
        .addField('Moderador', '<@' + message.author.id + '>', true)
        .addField('Razón', reason, true)
        .addField('Duración', '∞', true)
    
    let toDMEmbed = new discord.RichEmbed()
        .setColor(0xEF494B)
        .setAuthor('[SILENCIADO]', message.guild.iconURL)
        .setDescription('<@' + member.id + '>, has sido silenciado en ' + message.guild.name)
        .addField('Moderador', message.author.tag, true)
        .addField('Razón', reason, true)
        .addField('Duración', '∞', true)
    
    if (member.roles.has(role.id)) return message.channel.send(alreadyMutedEmbed)
    
    await member.addRole(role);
    await message.channel.send(successEmbed);
    await loggingChannel.send(loggingEmbed);
    await member.send(toDMEmbed);
}
