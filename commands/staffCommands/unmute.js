exports.run = async (discord, fs, client, message, args, command, supervisorsRole, noPrivilegesEmbed) => {
    
    //-unmute (@usuario | id) (motivo)
    
    try {
        if (message.author.id !== client.config.guild.botOwner && !message.member.roles.cache.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);

        let notToMuteEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.emotes.redTick} Debes mencionar a un miembro o escribir su id`);

        let noBotsEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.emotes.redTick} No puedes silenciar a un bot`);

        //Esto comprueba si se ha mencionado a un miembro o se ha proporcionado su ID
        const member = await client.functions.fetchMember(message.guild, args[0]);
        if (!member) return message.channel.send(notToMuteEmbed);

        let toDeleteCount = command.length - 2 + args[0].length + 2; 
        let reason = message.content.slice(toDeleteCount) || 'Indefinida';

        if (member.bot) return message.channel.send(noBotsEmbed);

        let notMutedEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.emotes.redTick} Este miembro no esta silenciado`);

        //Comprueba si existe el rol silenciado, sino lo crea
        let mutedRole = await client.functions.checkMutedRole(message.guild);
        if (!member.roles.cache.has(mutedRole.id)) return message.channel.send(notMutedEmbed);
        
        let successEmbed = new discord.MessageEmbed()
            .setColor(client.colors.green2)
            .setTitle(`${client.emotes.greenTick} Operación completada`)
            .setDescription(`El miembro **${member.user.tag}** ha sido des-silenciado`);

        let loggingEmbed = new discord.MessageEmbed()
            .setColor(client.colors.green)
            .setAuthor(`${member.user.tag} ha sido DES-SILENCIADO`, member.user.displayAvatarURL())
            .addField('Miembro', member.user.tag, true)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason, true);

        let toDMEmbed = new discord.MessageEmbed()
            .setColor(client.colors.green)
            .setAuthor('[DES-SILENCIADO]', message.guild.iconURL())
            .setDescription(`<@${member.id}>, has sido des-silenciado en ${message.guild.name}`)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason, true);

        await member.roles.remove(mutedRole);
        
        if (client.mutes.hasOwnProperty(member.id)) {
            delete client.mutes[member.id];
            await fs.writeFile('./databases/mutes.json', JSON.stringify(client.mutes), async err => {
                if (err) throw err;
            });
        };
        
        await message.delete();
        await message.channel.send(successEmbed);
        await client.loggingChannel.send(loggingEmbed);
        await member.send(toDMEmbed);
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, client, message, args, command, e);
    }
}
