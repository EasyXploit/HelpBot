exports.run = async (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //-rmwarn (@miembro | id) (cantidad) (razón)
    
    try {
        if (message.author.id !== config.botOwner && !message.member.roles.has(supervisorsRole.id)) return message.channel.send(noPrivilegesEmbed);
        
        let notToMuteEmbed = new discord.MessageEmbed ()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Debes mencionar a un miembro o escribir su id');

        let noBotsEmbed = new discord.MessageEmbed ()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Los bots no pueden ser advertidos');
        
        let noQuantityEmbed = new discord.MessageEmbed ()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Debes proporcionar la cantidad de advertencias a quitar');
        
        let undefinedReasonEmbed = new discord.MessageEmbed ()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Se debe adjuntar una razón');
        
        let noWarnsEmbed = new discord.MessageEmbed ()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ' Este usuario no tiene advertencias');

        //Esto comprueba si se ha mencionado a un usuario o se ha proporcionado su ID
        let member = await await message.guild.members.fetch(message.mentions.users.first() || args[0]);
        if (!member) return message.channel.send(notToMuteEmbed);
        if (member.user.bot) return message.channel.send(noBotsEmbed);
        
        //Esto comprueba si se ha aportado alguna cantidad numérica
        let quantity = args[1];
        if (!quantity || isNaN(quantity)) return message.channel.send(noQuantityEmbed);
        
        //Esto comprueba si se ha aportado alguna razón
        let reason = args.slice(2).join(" ") || 'Indefinida';
        if (reason === 'Indefinida' && message.author.id !== message.guild.ownerID) return message.channel.send(undefinedReasonEmbed);
          
        let moderator = await message.guild.members.fetch(message.author);
        
        //Se comprueba si puede advertir al usuario
        if (moderator.id !== message.guild.owner.id) {
            if (moderator.roles.highest.position <= member.roles.highest.position) return message.channel.send(noPrivilegesEmbed);
        }
        
        message.delete();

        let successEmbed = new discord.MessageEmbed ()
            .setColor(0xB8E986)
            .setDescription(`${resources.GreenTick} Se ha/n retirado ${quantity} advertencia/s al usuario <@${member.id}>`);

        let loggingEmbed = new discord.MessageEmbed ()
            .setColor(0x4A90E2)
            .setTitle('📑 Auditoría')
            .setDescription('Se ha/n retirado advertencia/s.')
            .setTimestamp()
            .setFooter(bot.user.username, bot.user.avatarURL)
            .addField('Fecha:', new Date().toLocaleString(), true)
            .addField('Emisor:', '<@' + message.author.id + '>', true)
            .addField('Cantidad:', quantity, true)
            .addField('Destino:', member.user.tag, true)
            .addField('Razón:', reason, true);

        //Comprueba si el usuario tiene warns
        if (!bot.warns[member.id]) return message.channel.send(noWarnsEmbed);
        
        let noCorrectQuantityEmbed = new discord.MessageEmbed ()
            .setColor(0xF12F49)
            .setDescription(resources.RedTick + ` Solo puedes retirar ${bot.warns[member.id].warns} advertencia/s a este usuario`);
        
        //Comprueba si la cantidad aportada se puede retirar
        if ((bot.warns[member.id].warns - quantity) < 0) return message.channel.send(noCorrectQuantityEmbed);
        
        //Resta los warns indicados en quantity
        bot.warns[member.id].warns = bot.warns[member.id].warns - quantity;
        
        //Si se queda en 0 warns, se borra la entrada del JSON
        if (bot.warns[member.id].warns === 0) await delete bot.warns[member.id];

        //Escribe el resultado en el JSON
        fs.writeFile('./warns.json', JSON.stringify(bot.warns, null, 4), async err => {
            if (err) throw err;

            await message.channel.send(successEmbed);
            await loggingChannel.send(loggingEmbed);
        });
    } catch (e) {
        require(`../../errorHandler.js`).run(discord, config, bot, message, args, command, e);
    }
}
