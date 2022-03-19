exports.run = async (client, message, args, command, commandConfig) => {
    
    try {
        
        let notToBanEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Miembro no encontrado. Debes mencionar a un miembro o escribir su ID.\nSi el usuario no está en el servidor, has de especificar su ID`);

        let noReasonEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar un motivo`);
        
        let alreadyBannedEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Este usuario ya ha sido baneado`);
        
        if (!args[0]) return message.channel.send({ embeds: [notToBanEmbed] });
        
        //Esto comprueba si se ha mencionado a un usuario o se ha proporcionado su ID
        const user = await client.functions.fetchUser(args[0]);
        if (!user) return message.channel.send({ embeds: [notToBanEmbed] });
        
        const moderator = await client.functions.fetchMember(message.guild, message.author.id);
        const member = await client.functions.fetchMember(message.guild, user.id);

        if (member) {
            //Se comprueba si puede banear al usuario
            if (moderator.roles.highest.position <= member.roles.highest.position) {

                let cannotBanHigherRoleEmbed = new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} No puedes banear a un miembro con un rol igual o superior al tuyo`);

                return message.channel.send({ embeds: [cannotBanHigherRoleEmbed] });
            };
        };
        
        //Se comprueba si el usuario ya estaba baneado
        let bans = await message.guild.bans.fetch();

        async function checkBans (bans) {
            for (const item of bans) if (item[0] === user.id) return true;
        };

        let banned = await checkBans(bans);
        if (banned) return message.channel.send({embeds: [alreadyBannedEmbed] });

        //Genera un mensaje de confirmación
        let successEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.orangeTick} **${user.tag}** ha sido baneado, ¿alguien más?`);

        //Almacena la razón
        let reason = args.splice(1).join(' ');

        //Si se ha proporcionado razón, la adjunta al mensaje de confirmación
        if (reason) successEmbed.setDescription(`${client.customEmojis.orangeTick} **${user.tag}** ha sido baneado debido a **${reason}**, ¿alguien más?`);

        //Esto comprueba si se debe proporcionar razón
        if (!reason && message.author.id !== message.guild.ownerId) return message.channel.send({ embeds: [noReasonEmbed] });
        if (!reason) reason = 'Indefinida';

        let toDMEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setAuthor({ name: '[BANEADO]', iconURL: message.guild.iconURL({ dynamic: true}) })
            .setDescription(`<@${user.id}>, has sido baneado en ${message.guild.name}`)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason, true)
            .addField('Duración', '∞', true);

        if (member) await user.send({ embeds: [toDMEmbed] });
        await message.guild.members.ban(user, {reason: `Moderador: ${message.author.id}, Razón: ${reason}`});
        await message.channel.send({ embeds: [successEmbed] });
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'ban',
    description: 'Banea a un miembro.',
    aliases: [],
    parameters: '<@miembro| id> [razón]'
};
