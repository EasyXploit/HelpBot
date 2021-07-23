exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!mute (@usuario | id) (motivo)
    
    try {
        let notToMuteEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} Debes mencionar a un miembro o escribir su id`);

        let noBotsEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} No puedes silenciar a un bot`);

        //Esto comprueba si se ha mencionado a un miembro o se ha proporcionado su ID
        const member = await client.functions.fetchMember(message.guild, args[0]);
        if (!member) return message.channel.send(notToMuteEmbed);

        if (member.user.bot) return message.channel.send(noBotsEmbed);
        
        let moderator = await client.functions.fetchMember(message.guild, message.author.id);
        
        //Se comprueba si puede banear al miembro
        if (moderator.id !== message.guild.owner.id) {
            if (moderator.roles.highest.position <= member.roles.highest.position) {

                let cannotMuteHigherRoleEmbed = new discord.MessageEmbed()
                    .setColor(client.colors.red)
                    .setDescription(`${client.customEmojis.redTick} No puedes silenciar a un miembro con un rol igual o superior al tuyo`);
    
                return message.channel.send(cannotMuteHigherRoleEmbed);
            };
        };

        //Comprueba si existe el rol silenciado, sino lo crea
        const mutedRole = await client.functions.checkMutedRole(message.guild);

        let alreadyMutedEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} Este miembro ya esta silenciado`);

        //Comprueba si el miembro tiene el rol silenciado, sino se lo añade
        if (member.roles.cache.has(mutedRole.id)) return message.channel.send(alreadyMutedEmbed);
        member.roles.add(mutedRole);

        //Propaga el rol silenciado
        client.functions.spreadMutedRole(message.guild);
        
        let toDeleteCount = command.length - 2 + args[0].length + 2; 
        let reason = message.content.slice(toDeleteCount) || 'Indefinida';

        let successEmbed = new discord.MessageEmbed()
            .setColor(client.colors.green2)
            .setTitle(`${client.customEmojis.greenTick} Operación completada`)
            .setDescription(`El miembro **${member.user.tag}** ha sido silenciado, ¿alguien más?`);

        let loggingEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setAuthor(`${member.user.tag} ha sido SILENCIADO`, member.user.displayAvatarURL({dynamic: true}))
            .addField('Miembro', member.user.tag, true)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason, true)
            .addField('Duración', '∞', true);

        let toDMEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setAuthor('[SILENCIADO]', message.guild.iconURL({ dynamic: true}))
            .setDescription(`<@${member.id}>, has sido silenciado en ${message.guild.name}`)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason, true)
            .addField('Duración', '∞', true);

        await message.channel.send(successEmbed);
        await client.functions.loggingManager(loggingEmbed);
        await member.send(toDMEmbed);
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'mute',
    aliases: []
};
