exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //-rmwarn (@miembro | id) (id de advertencia | all) (razón)
    
    try {
        let notToUnwarnEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} Debes mencionar a un miembro o escribir su id`);

        let noBotsEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} Los bots no pueden ser advertidos`);
        
        let noWarnIDEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} Debes proporcionar el ID de la advertencia a quitar`);
        
        let undefinedReasonEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} Se debe adjuntar una razón`);
        
        let noWarnsEmbed = new discord.MessageEmbed()
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
          
        let moderator = await resources.fetchMember(message.guild, message.author.id);
        
        //Se comprueba si puede des-advertir al usuario
        if (moderator.id !== message.guild.owner.id) {
            if (moderator.roles.highest.position <= member.roles.highest.position) return message.channel.send(noPrivilegesEmbed);
        }
        
        message.delete();

        //Comprueba si el usuario tiene warns
        if (!client.warns[member.id]) return message.channel.send(noWarnsEmbed);

        let successEmbed, loggingEmbed, toDMEmbed;

        if (warnID === 'all') {
            if (message.author.id !== config.botOwner && !message.member.roles.cache.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);

            successEmbed = new discord.MessageEmbed()
                .setColor(resources.green2)
                .setDescription(`${resources.GreenTick} Se han retirado todas las advertencias al usuario **${member.user.tag}**`);

            toDMEmbed = new discord.MessageEmbed()
                .setColor(resources.green)
                .setAuthor('[DES-ADVERTIDO]', message.guild.iconURL())
                .setDescription(`<@${member.id}>, se te han retirado todas la advertencias.`)
                .addField('Moderador', message.author.tag, true)
                .addField('Razón', reason, true);

            loggingEmbed = new discord.MessageEmbed()
                .setColor(resources.blue)
                .setTitle('📑 Auditoría - [INFRACCIONES]')
                .setDescription('Se han retirado todas las advertencias.')
                .addField('Fecha:', new Date().toLocaleString(), true)
                .addField('Moderador:', message.author.tag, true)
                .addField('Miembro:', member.user.tag, true)
                .addField('Razón:', reason, true);

            delete client.warns[member.id];
        } else {
            if (message.author.id !== config.botOwner && !message.member.roles.cache.has(supervisorsRole.id) && client.warns[member.id][warnID].moderator !== message.author.id) return message.channel.send(noPrivilegesEmbed);
            
            successEmbed = new discord.MessageEmbed()
                .setColor(resources.green2)
                .setDescription(`${resources.GreenTick} Se ha retirado la advertencia con ID **${warnID}** al usuario **${member.user.tag}**`);

            toDMEmbed = new discord.MessageEmbed()
                .setColor(resources.green)
                .setAuthor('[DES-ADVERTIDO]', message.guild.iconURL())
                .setDescription(`<@${member.id}>, se te ha retirado la advertencia con ID \`${warnID}\``)
                .addField('Moderador', message.author.tag, true)
                .addField('ID de advertencia:', warnID, true)
                .addField('Advertencia:', client.warns[member.id][warnID].reason, true)
                .addField('Razón', reason, true);

            loggingEmbed = new discord.MessageEmbed()
                .setColor(resources.blue)
                .setTitle('📑 Auditoría - [INFRACCIONES]')
                .setDescription('Se ha retirado una advertencia.')
                .addField('Fecha:', new Date().toLocaleString(), true)
                .addField('Moderador:', message.author.tag, true)
                .addField('ID de advertencia:', warnID, true)
                .addField('Sanción:', client.warns[member.id][warnID].reason, true)
                .addField('Miembro:', member.user.tag, true)
                .addField('Razón:', reason, true);

            //Resta el warn indicado
            delete client.warns[member.id][warnID];
            
            //Si se queda en 0 warns, se borra la entrada del JSON
            if (Object.keys(client.warns[member.id]).length === 0) delete client.warns[member.id];
        }

        //Escribe el resultado en el JSON
        fs.writeFile('./storage/warns.json', JSON.stringify(client.warns, null, 4), async err => {
            if (err) throw err;

            await loggingChannel.send(loggingEmbed);
            await member.send(toDMEmbed);
            await message.channel.send(successEmbed);
        });
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}
