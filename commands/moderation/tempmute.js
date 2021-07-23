exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!tempmute (@usuario | id) (xS | xM | xH | xD) (motivo)
    
    try {
        let notToMuteEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} No se ha encontrado al miembro. Debes mencionarlo o escribir su id`);

        let noBotsEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} No puedes silenciar a un bot`);
        
        let noCorrectTimeEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar una unidad de medida de tiempo. Por ejemplo: \`5s\`, \`10m\`, \`12h\` o \`3d\``);

        //Esto comprueba si se ha mencionado a un miembro o se ha proporcionado su ID
        const member = await client.functions.fetchMember(message.guild, args[0]);
        if (!member) return message.channel.send(notToMuteEmbed);

        if (member.user.bot) return message.channel.send(noBotsEmbed);
        
        //Esto comprueba si se ha proporcionado una unidad de medida de tiempo
        if (!args[1]) return message.channel.send(noCorrectTimeEmbed);
        
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

        //Comprueba si el miembro tiene el rol silenciado
        if (member.roles.cache.has(mutedRole.id)) return message.channel.send(alreadyMutedEmbed);

        //Propaga el rol silenciado
        client.functions.spreadMutedRole(message.guild);
        
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

        let authorized;

        //Para cada ID de rol de la lista blanca
        for (let i = 0; i < commandConfig.rolesThatCanUseUnlimitedTime.length; i++) {

            //Si se permite si el que invocó el comando es el dueño, o uno de los roles del miembro coincide con la lista blanca, entonces permite la ejecución
            if (message.author.id === message.guild.ownerID || message.author.id === client.config.guild.botManagerRole || message.member.roles.cache.find(r => r.id === commandConfig.rolesThatCanUseUnlimitedTime[i])) {
                authorized = true;
                break;
            };
        };

        //Si no se permitió la ejecución, manda un mensaje de error
        if (!authorized && milliseconds > 86400000) {
            let maxTimeEmbed = new discord.MessageEmbed()
                .setColor(client.colors.red2)
                .setDescription(`${client.customEmojis.redTick} Los moderadores solo pueden silenciar un máximo de 1 día`);

            return message.channel.send(maxTimeEmbed);
        };
        
        let toDeleteCount = command.length - 2 + args[0].length + 1 + args[1].length + 2; 
        let reason = message.content.slice(toDeleteCount) || 'Indefinida';

        if (message.author.id !== client.homeGuild.ownerID) {
            let undefinedReasoneEmbed = new discord.MessageEmbed()
                .setColor(client.colors.red2)
                .setDescription(`${client.customEmojis.redTick} Los moderadores deben adjuntar una razón`);

            if (reason === 'Indefinida' && !authorized) return message.channel.send(undefinedReasoneEmbed);
        };

        let loggingEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setAuthor(`${member.user.tag} ha sido SILENCIADO`, member.user.displayAvatarURL({dynamic: true}))
            .addField('Miembro', member.user.tag, true)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason, true)
            .addField('Duración', args[1], true);

        let toDMEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setAuthor('[SILENCIADO]', message.guild.iconURL({ dynamic: true}))
            .setDescription(`<@${member.id}>, has sido silenciado en ${message.guild.name}`)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason, true)
            .addField('Duración', args[1], true);

        //Guarda en la base de datos
        client.mutes[member.id] = {
            time: Date.now() + milliseconds
        };

        client.fs.writeFile('./databases/mutes.json', JSON.stringify(client.mutes, null, 4), async err => {
            if (err) throw err;

            let successEmbed = new discord.MessageEmbed()
                .setColor(client.colors.green2)
                .setTitle(`${client.customEmojis.greenTick} Operación completada`)
                .setDescription(`El miembro **${member.user.tag}** ha sido silenciado, ¿alguien más?`);

            //Silencia al miembro
            member.roles.add(mutedRole);
            
            await message.channel.send(successEmbed);
            await client.functions.loggingManager(loggingEmbed);
            await member.send(toDMEmbed);
        });
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'tempmute',
    aliases: []
};
