exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //-rmwarn (@miembro | id) (id de sanción | all) (razón)
    
    try {
        let notToUnwarnEmbed = new discord.MessageEmbed ()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} Debes mencionar a un miembro o escribir su id`);

        let noBotsEmbed = new discord.MessageEmbed ()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} Los bots no pueden ser advertidos`);
        
        let noWarnIDEmbed = new discord.MessageEmbed ()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} Debes proporcionar el ID de la advertencia a quitar`);
        
        let undefinedReasonEmbed = new discord.MessageEmbed ()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} Se debe adjuntar una razón`);
        
        let noWarnsEmbed = new discord.MessageEmbed ()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} Este usuario no tiene advertencias`);

        //Esto comprueba si se ha mencionado a un usuario o se ha proporcionado su ID
        const member = await resources.fetchMember(message.guild, args[0]);
        if (!member) return message.channel.send(notToUnwarnEmbed);
        if (member.user.bot) return message.channel.send(noBotsEmbed);
        
        //Esto comprueba si se ha aportado alguna cantidad numérica
        let warnID = args[1].toLowerCase();
        if (!warnID || isNaN(warnID) && warnID !== 'all') return message.channel.send(noWarnIDEmbed);
        
        //Esto comprueba si se ha aportado alguna razón
        let reason = args.slice(2).join(" ") || 'Indefinida';
        if (reason === 'Indefinida' && message.author.id !== message.guild.ownerID) return message.channel.send(undefinedReasonEmbed);
          
        let moderator = await message.guild.members.fetch(message.author);
        
        //Se comprueba si puede des-advertir al usuario
        if (moderator.id !== message.guild.owner.id) {
            if (moderator.roles.highest.position <= member.roles.highest.position) return message.channel.send(noPrivilegesEmbed);
        }
        
        message.delete();

        //Comprueba si el usuario tiene warns
        if (!bot.warns[member.id]) return message.channel.send(noWarnsEmbed);

        let successEmbed, loggingEmbed;

        if (warnID === 'all') {
            if (message.author.id !== config.botOwner && !message.member.roles.cache.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);

            successEmbed = new discord.MessageEmbed ()
                .setColor(resources.green)
                .setDescription(`${resources.GreenTick} Se han retirado todas las advertencias al usuario <@${member.id}>`);

            loggingEmbed = new discord.MessageEmbed ()
                .setColor(resources.blue)
                .setTitle('📑 Auditoría')
                .setDescription('Se han retirado todas las advertencias.')
                .setTimestamp()
                .setFooter(bot.user.username, bot.user.avatarURL())
                .addField('Fecha:', new Date().toLocaleString(), true)
                .addField('Emisor:', `<@${message.author.id}>`, true)
                .addField('Miembro:', member.user.tag, true)
                .addField('Razón:', reason, true);

            delete bot.warns[member.id];
        } else {
            if (message.author.id !== config.botOwner && !message.member.roles.cache.has(supervisorsRole.id) && bot.warns[member.id][warnID].moderator !== message.author.id) return message.channel.send(noPrivilegesEmbed);

            successEmbed = new discord.MessageEmbed ()
                .setColor(resources.green)
                .setDescription(`${resources.GreenTick} Se ha retirado la advertencia con ID **${warnID}** al usuario <@${member.id}>`);

            loggingEmbed = new discord.MessageEmbed ()
                .setColor(resources.blue)
                .setTitle('📑 Auditoría')
                .setDescription('Se ha retirado una advertencia.')
                .setTimestamp()
                .setFooter(bot.user.username, bot.user.avatarURL())
                .addField('Fecha:', new Date().toLocaleString(), true)
                .addField('Emisor:', `<@${message.author.id}>`, true)
                .addField('ID de advertencia:', warnID, true)
                .addField('Sanción:', bot.warns[member.id][warnID].reason, true)
                .addField('Miembro:', member.user.tag, true)
                .addField('Razón:', reason, true);

            //Resta el warn indicado
            delete bot.warns[member.id][warnID];
            
            //Si se queda en 0 warns, se borra la entrada del JSON
            if (Object.keys(bot.warns[member.id]).length === 0) delete bot.warns[member.id];
        }

        //Escribe el resultado en el JSON
        fs.writeFile('./storage/warns.json', JSON.stringify(bot.warns, null, 4), async err => {
            if (err) throw err;

            await message.channel.send(successEmbed);
            await loggingChannel.send(loggingEmbed);
        });
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, config, bot, message, args, command, e);
    }
}
