exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //-warn (@miembro | id) (razón)
    
    try {
        let notToWarnEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} Debes mencionar a un miembro o escribir su id`);

        let noBotsEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} No puedes advertir a un bot`);
        
        let undefinedReasonEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} Se debe adjuntar una razón`);

        //Esto comprueba si se ha mencionado a un usuario o se ha proporcionado su ID
        const member = await resources.fetchMember(message.guild, args[0]);
        if (!member) return message.channel.send(notToWarnEmbed);
        if (member.user.bot) return message.channel.send(noBotsEmbed);

        //Esto comprueba si se ha aportado alguna razón
        let reason = args.slice(1).join(' ');
        if (!reason) return message.channel.send(undefinedReasonEmbed);
          
        let moderator = await resources.fetchMember(message.guild, message.author.id);
        
        //Se comprueba si puede advertir al usuario
        if (moderator.id !== message.guild.owner.id) {
            if (moderator.roles.highest.position <= member.roles.highest.position) return message.channel.send(noPrivilegesEmbed);
        }
        
        message.delete();

        require('../../utils/infractionsHandler.js').run(discord, fs, config, client, resources, loggingChannel, message, message.guild, member, reason, 2, message.author)

    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}
