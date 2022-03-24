exports.run = async (client, message, args, command, commandConfig) => {
    
    try {
        
        let notToBanEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Miembro no encontrado. Debes mencionar a un miembro o escribir su ID.\nSi el usuario no está en el servidor, has de especificar su ID`);

        let incorrectTimeEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar una cantidad válida de días de mensajes a borrar, entre 1 y 7`);

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
        
        let bans = await message.guild.bans.fetch();
        let isBanned;
        
        await bans.forEach( async ban => {
            if(ban.id === user.id) return isBanned = ban.id;
        });
        if (isBanned) return message.channel.send({ embeds: [alreadyBannedEmbed] });

        let days = Math.floor(args[1]);
        if (isNaN(days) || days < 1 || days > 7) return message.channel.send({ embeds: [incorrectTimeEmbed] });

        //Genera un mensaje de confirmación
        let successEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.orangeTick} **${user.tag}** ha sido baneado, ¿alguien más?`);

        //Almacena la razón
        let reason = args.slice(2).join(' ');

        //Si se ha proporcionado razón, la adjunta al mensaje de confirmación
        if (reason) successEmbed.setDescription(`${client.customEmojis.orangeTick} **${member.user.tag}** ha sido baneado debido a **${reason}**, ¿alguien más?`);

        //Esto comprueba si se debe proporcionar razón
        if (!reason && message.author.id !== message.guild.ownerId) return message.channel.send({ embeds: [noReasonEmbed] });
        if (!reason) reason = `Indefinida`;

        let toDMEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setAuthor({ name: '[BANEADO]', iconURL: message.guild.iconURL({ dynamic: true}) })
            .setDescription(`<@${user.id}>, has sido baneado en ${message.guild.name}`)
            .addField(`Moderador`, message.author.tag, true)
            .addField(`Razón`, reason, true)
            .addField(`Días de mensajes borrados`, days.toString(), true)
            .addField(`Duración`, `∞`, true);

        if (member) await user.send({ embeds: [toDMEmbed] });
        await message.guild.members.ban(user, {days: days, reason: `Moderador: ${message.author.id}, Días de mensajes borrados: ${days}, Razón: ${reason}`});
        await message.channel.send({ embeds: [successEmbed] });

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'softban',
    description: 'Banea a un miembro, eliminando X días de mensajes suyos.',
    aliases: [],
    parameters: '<@miembro| id> <días (1-7)> [razón]'
};
