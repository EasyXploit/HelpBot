exports.run = async (client, message, args, command, commandConfig) => {
    
    try {

        let notToMuteEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Debes mencionar a un miembro o escribir su id`);

        let noBotsEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} No puedes silenciar a un bot`);

        //Esto comprueba si se ha mencionado a un miembro o se ha proporcionado su ID
        const member = await client.functions.fetchMember(message.guild, args[0]);
        if (!member) return message.channel.send({ embeds: [notToMuteEmbed] });

        let reason = args.splice(1).join(' ') || 'Indefinida';

        if (member.bot) return message.channel.send({ embeds: [noBotsEmbed] });

        let notMutedEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Este miembro no esta silenciado`);

        //Comprueba si existe el rol silenciado, sino lo crea
        let mutedRole = await client.functions.checkMutedRole(message.guild);
        if (!member.roles.cache.has(mutedRole.id)) return message.channel.send({ embeds: [notMutedEmbed] });
        
        let successEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryCorrect)
            .setTitle(`${client.customEmojis.greenTick} Operación completada`)
            .setDescription(`El miembro **${member.user.tag}** ha sido des-silenciado`);

        let loggingEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.correct)
            .setAuthor({ name: `${member.user.tag} ha sido DES-SILENCIADO`, iconURL: member.user.displayAvatarURL({dynamic: true}) })
            .addField('Miembro', member.user.tag, true)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason, true);

        let toDMEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.correct)
            .setAuthor({ name: '[DES-SILENCIADO]', iconURL: message.guild.iconURL({ dynamic: true}) })
            .setDescription(`<@${member.id}>, has sido des-silenciado en ${message.guild.name}`)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason, true);

        await member.roles.remove(mutedRole);
        
        if (client.db.mutes.hasOwnProperty(member.id)) {
            delete client.db.mutes[member.id];
            await client.fs.writeFile('./databases/mutes.json', JSON.stringify(client.db.mutes), async err => {
                if (err) throw err;
            });
        };
        
        await message.channel.send({ embeds: [successEmbed] });
        await client.functions.loggingManager('embed', loggingEmbed);
        await member.send({ embeds: [toDMEmbed] });
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'unmute',
    description: 'Dessilencia a un miembro.',
    aliases: [],
    parameters: '<@miembro| id> [razón]'
};
