exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!unmute (@usuario | id) (motivo)
    
    try {

        let notToMuteEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error2)
            .setDescription(`${client.customEmojis.redTick} Debes mencionar a un miembro o escribir su id`);

        let noBotsEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error2)
            .setDescription(`${client.customEmojis.redTick} No puedes silenciar a un bot`);

        //Esto comprueba si se ha mencionado a un miembro o se ha proporcionado su ID
        const member = await client.functions.fetchMember(message.guild, args[0]);
        if (!member) return message.channel.send({ embeds: [notToMuteEmbed] });

        let toDeleteCount = command.length - 2 + args[0].length + 2; 
        let reason = message.content.slice(toDeleteCount) || 'Indefinida';

        if (member.bot) return message.channel.send({ embeds: [noBotsEmbed] });

        let notMutedEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.error2)
            .setDescription(`${client.customEmojis.redTick} Este miembro no esta silenciado`);

        //Comprueba si existe el rol silenciado, sino lo crea
        let mutedRole = await client.functions.checkMutedRole(message.guild);
        if (!member.roles.cache.has(mutedRole.id)) return message.channel.send({ embeds: [notMutedEmbed] });
        
        let successEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.correct2)
            .setTitle(`${client.customEmojis.greenTick} Operación completada`)
            .setDescription(`El miembro **${member.user.tag}** ha sido des-silenciado`);

        let loggingEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.correct)
            .setAuthor(`${member.user.tag} ha sido DES-SILENCIADO`, member.user.displayAvatarURL({dynamic: true}))
            .addField('Miembro', member.user.tag, true)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason, true);

        let toDMEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.correct)
            .setAuthor('[DES-SILENCIADO]', message.guild.iconURL({ dynamic: true}))
            .setDescription(`<@${member.id}>, has sido des-silenciado en ${message.guild.name}`)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason, true);

        await member.roles.remove(mutedRole);
        
        if (client.mutes.hasOwnProperty(member.id)) {
            delete client.mutes[member.id];
            await client.fs.writeFile('./databases/mutes.json', JSON.stringify(client.mutes), async err => {
                if (err) throw err;
            });
        };
        
        await message.channel.send({ embeds: [successEmbed] });
        await client.functions.loggingManager(loggingEmbed);
        await member.send({ embeds: [toDMEmbed] });
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'unmute',
    aliases: []
};
