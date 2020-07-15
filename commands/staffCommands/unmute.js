exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //-unmute (@usuario | id) (motivo)
    
    try {
        if (message.author.id !== config.botOwner && !message.member.roles.cache.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);

        let notToMuteEmbed = new discord.MessageEmbed ()
            .setColor(0xF12F49)
            .setDescription(`${resources.RedTick} Debes mencionar a un miembro o escribir su id`);

        let noBotsEmbed = new discord.MessageEmbed ()
            .setColor(0xF12F49)
            .setDescription(`${resources.RedTick} No puedes silenciar a un bot`);

        //Esto comprueba si se ha mencionado a un usuario o se ha proporcionado su ID
        let member = await message.guild.members.fetch(message.mentions.users.first() || args[0]);
        if (!member) return message.channel.send(notToMuteEmbed);
        let toDeleteCount = command.length - 2 + args[0].length + 2; 
        let reason = message.content.slice(toDeleteCount) || 'Indefinida';

        if (member.bot) return message.channel.send('noBotsEmbed');

        let role = message.guild.roles.cache.find(r => r.name === 'Silenciado');

        let notMutedEmbed = new discord.MessageEmbed ()
            .setColor(0xF12F49)
            .setDescription(`${resources.RedTick} Este usuario no esta silenciado`);

        let successEmbed = new discord.MessageEmbed ()
            .setColor(0xB8E986)
            .setTitle(`${resources.GreenTick} Operación completada`)
            .setDescription(`El usuario <@${member.id}> ha sido des-silenciado`);

        let loggingEmbed = new discord.MessageEmbed ()
            .setColor(0x3EB57B)
            .setAuthor(`${member.user.tag} ha sido DES-SILENCIADO`, member.user.displayAvatarURL())
            .addField('Miembro', `<@${member.id}>`, true)
            .addField('Moderador', `<@${message.author.id}>`, true)
            .addField('Razón', reason, true);

        let toDMEmbed = new discord.MessageEmbed ()
            .setColor(0x3EB57B)
            .setAuthor('[DES-SILENCIADO]', message.guild.iconURL())
            .setDescription(`<@${member.id}>, has sido des-silenciado en ${message.guild.name}`)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason, true);

        if (!role || !member.roles.cache.has(role.id)) return message.channel.send(notMutedEmbed);

        await member.roles.remove(role);
        
        if (bot.mutes.hasOwnProperty(member.id)) {
            await delete bot.mutes[member.id];
            await fs.writeFile('./mutes.json', JSON.stringify(bot.mutes), async err => {
                if (err) throw err;
            });
        };
        
        await message.channel.send(successEmbed);
        await loggingChannel.send(loggingEmbed);
        await member.send(toDMEmbed);
    } catch (e) {
        require('../../errorHandler.js').run(discord, config, bot, message, args, command, e);
    }
}
