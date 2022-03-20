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

        if (member.user.bot) return message.channel.send({ embeds: [noBotsEmbed] });
        
        let moderator = await client.functions.fetchMember(message.guild, message.author.id);
        
        //Se comprueba si puede banear al miembro
        if (moderator.id !== message.guild.ownerId) {
            if (moderator.roles.highest.position <= member.roles.highest.position) {

                let cannotMuteHigherRoleEmbed = new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} No puedes silenciar a un miembro con un rol igual o superior al tuyo`);
    
                return message.channel.send({ embeds: [cannotMuteHigherRoleEmbed] });
            };
        };

        //Comprueba si existe el rol silenciado, sino lo crea
        const mutedRole = await client.functions.checkMutedRole(message.guild);

        let alreadyMutedEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Este miembro ya esta silenciado`);

        //Comprueba si el miembro tiene el rol silenciado, sino se lo añade
        if (member.roles.cache.has(mutedRole.id)) return message.channel.send({ embeds: [alreadyMutedEmbed] });
        member.roles.add(mutedRole);

        //Propaga el rol silenciado
        client.functions.spreadMutedRole(message.guild);

        //Genera un mensaje de confirmación
        let successEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.orangeTick} **${member.user.tag}** ha sido silenciado, ¿alguien más?`);
        
        //Almacena la razón
        let reason = args.splice(1).join(' ');

        //Si se ha proporcionado razón, la adjunta al mensaje de confirmación
        if (reason) successEmbed.setDescription(`${client.customEmojis.orangeTick} **${member.user.tag}** ha sido silenciado debido a **${reason}**, ¿alguien más?`);

        //Esto comprueba si se ha proporcionado una razón
        if (!reason) reason = 'Indefinida';

        let loggingEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setAuthor({ name: `${member.user.tag} ha sido SILENCIADO`, iconURL: member.user.displayAvatarURL({dynamic: true}) })
            .addField('Miembro', member.user.tag, true)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason, true)
            .addField('Duración', '∞', true);

        let toDMEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setAuthor({ name: '[SILENCIADO]', iconURL: message.guild.iconURL({ dynamic: true}) })
            .setDescription(`<@${member.id}>, has sido silenciado en ${message.guild.name}`)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason, true)
            .addField('Duración', '∞', true);

        await message.channel.send({ embeds: [successEmbed] });
        await client.functions.loggingManager('embed', loggingEmbed);
        await member.send({ embeds: [toDMEmbed] });
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'mute',
    description: 'Silencia a un miembro de los canales de texto y voz.',
    aliases: [],
    parameters: '<@miembro| id> [razón]'
};
