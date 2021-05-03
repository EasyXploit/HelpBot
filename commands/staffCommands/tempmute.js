exports.run = async (discord, fs, config, keys, client, message, args, command, loggingChannel, debuggingChannel, resources, supervisorsRole, noPrivilegesEmbed) => {
    
    //-tempmute (@usuario | id) (xS | xM | xH | xD) (motivo)
    
    try {
        let notToMuteEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} Debes mencionar a un miembro o escribir su id`);

        let noBotsEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} No puedes silenciar a un bot`);
        
        let noCorrectTimeEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} Debes proporcionar una unidad de medida de tiempo. Por ejemplo: \`5s\`, \`10m\`, \`12h\` o \`3d\``);

        //Esto comprueba si se ha mencionado a un miembro o se ha proporcionado su ID
        const member = await resources.fetchMember(message.guild, args[0]);
        if (!member) return message.channel.send(notToMuteEmbed);

        if (member.user.bot) return message.channel.send(noBotsEmbed);
        
        //Esto comprueba si se ha proporcionado una unidad de medida de tiempo
        if (!args[1]) return message.channel.send(noCorrectTimeEmbed);
        
        let moderator = await resources.fetchMember(message.guild, message.author.id);
        
        //Se comprueba si puede banear al miembro
        if (moderator.id !== message.guild.owner.id) {
            if (moderator.roles.highest.position <= member.roles.highest.position) return message.channel.send(noPrivilegesEmbed)
        };

        //Comprueba si existe el rol silenciado, sino lo crea
        const mutedRole = await resources.checkMutedRole(message.guild);

        let alreadyMutedEmbed = new discord.MessageEmbed()
            .setColor(resources.red2)
            .setDescription(`${resources.RedTick} Este miembro ya esta silenciado`);

        //Comprueba si el miembro tiene el rol silenciado, sino se lo añade
        if (member.roles.cache.has(mutedRole.id)) return message.channel.send(alreadyMutedEmbed);
        member.roles.add(mutedRole);

        //Propaga el rol silenciado
        resources.spreadMutedRole(message.guild);

        let successEmbed = new discord.MessageEmbed()
            .setColor(resources.green2)
            .setTitle(`${resources.GreenTick} Operación completada`)
            .setDescription(`El miembro **${member.user.tag}** ha sido silenciado, ¿alguien más?`);
        
        //Comprueba la longitud del tiempo proporcionado
        if (args[1].length < 2) return message.channel.send(noCorrectTimeEmbed);

        //Divide el tiempo y la unidad de medida proporcionados
        let time = args[1].slice(0, -1);
        let measure = args[1].slice(-1).toLowerCase();

        //Comprueba si se ha proporcionado un número.
        if (isNaN(time)) return message.channel.send(noCorrectTimeEmbed);

        //Comprueba si se ha proporcionado una nunida de medida válida
        if (measure !== 's' && measure !== 'm' && measure !== 'h' && measure !== 'd') return message.channel.send(noCorrectTimeEmbed);

        let milliseconds;

        function stoms(seg) {milliseconds = seg * 1000}
        function mtoms(min) {milliseconds = min * 60000}
        function htoms(hour) {milliseconds = hour * 3600000}
        function dtoms(day) {milliseconds = day * 86400000} 

        switch (measure) {
            case 's':
                stoms(time);
                break;
            case 'm':
                mtoms(time);
                break;
            case 'h':
                htoms(time);
                break;
            case 'd':
                dtoms(time);
                break;
        }
        
        if (message.author.id !== config.botOwner) {
            let maxTimeEmbed = new discord.MessageEmbed()
                .setColor(resources.red2)
                .setDescription(`${resources.RedTick} Los moderadores solo pueden silenciar un máximo de 1 día`);

            if (milliseconds > 86400000 && !message.member.roles.cache.has(supervisorsRole.id)) return message.channel.send(maxTimeEmbed);
        }
        
        let toDeleteCount = command.length - 2 + args[0].length + 1 + args[1].length + 2; 
        let reason = message.content.slice(toDeleteCount) || 'Indefinida';
        if (message.author.id !== config.botOwner) {
            let undefinedReasoneEmbed = new discord.MessageEmbed()
                .setColor(resources.red2)
                .setDescription(`${resources.RedTick} Los moderadores deben adjuntar una razón`);

            if (reason === 'Indefinida' && !message.member.roles.cache.has(supervisorsRole.id)) return message.channel.send(undefinedReasoneEmbed);
        };

        let loggingEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setAuthor(`${member.user.tag} ha sido SILENCIADO`, member.user.displayAvatarURL())
            .addField('Miembro', member.user.tag, true)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason, true)
            .addField('Duración', args[1], true);

        let toDMEmbed = new discord.MessageEmbed()
            .setColor(resources.red)
            .setAuthor('[SILENCIADO]', message.guild.iconURL())
            .setDescription(`<@${member.id}>, has sido silenciado en ${message.guild.name}`)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason, true)
            .addField('Duración', args[1], true);

        client.mutes[member.id] = {
            time: Date.now() + milliseconds
        };

        fs.writeFile('./storage/mutes.json', JSON.stringify(client.mutes, null, 4), async err => {
            if (err) throw err;

            await message.delete();
            await message.channel.send(successEmbed);
            await loggingChannel.send(loggingEmbed);
            await member.send(toDMEmbed);
        });
    } catch (e) {
        require('../../utils/errorHandler.js').run(discord, config, client, message, args, command, e);
    }
}
