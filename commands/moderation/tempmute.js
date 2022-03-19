exports.run = async (client, message, args, command, commandConfig) => {
    
    try {
        
        let notToMuteEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} No se ha encontrado al miembro. Debes mencionarlo o escribir su id`);

        let noBotsEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} No puedes silenciar a un bot`);
        
        let noCorrectTimeEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar una unidad de medida de tiempo. Por ejemplo: \`5s\`, \`10m\`, \`12h\` o \`3d\`.`);

        //Esto comprueba si se ha mencionado a un miembro o se ha proporcionado su ID
        const member = await client.functions.fetchMember(message.guild, args[0]);
        if (!member) return message.channel.send({ embeds: [notToMuteEmbed] });

        if (member.user.bot) return message.channel.send({ embeds: [noBotsEmbed] });
        
        //Esto comprueba si se ha proporcionado una unidad de medida de tiempo
        if (!args[1]) return message.channel.send({ embeds: [noCorrectTimeEmbed] });
        
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

        //Comprueba si el miembro tiene el rol silenciado
        if (member.roles.cache.has(mutedRole.id)) return message.channel.send({ embeds: [alreadyMutedEmbed] });

        //Propaga el rol silenciado
        client.functions.spreadMutedRole(message.guild);
        
        //Comprueba la longitud del tiempo proporcionado
        if (args[1].length < 2) return message.channel.send({ embeds: [noCorrectTimeEmbed] });

        //Divide el tiempo y la unidad de medida proporcionados
        let time = args[1].slice(0, -1);
        let measure = args[1].slice(-1).toLowerCase();

        //Comprueba si se ha proporcionado un número.
        if (isNaN(time)) return message.channel.send({ embeds: [noCorrectTimeEmbed] });

        //Comprueba si se ha proporcionado una nunida de medida válida
        if (measure !== 's' && measure !== 'm' && measure !== 'h' && measure !== 'd') return message.channel.send({ embeds: [noCorrectTimeEmbed] });

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
        for (let i = 0; i < commandConfig.unlimitedTime.length; i++) {

            //Si se permite si el que invocó el comando es el dueño, o uno de los roles del miembro coincide con la lista blanca, entonces permite la ejecución
            if (message.author.id === message.guild.ownerId || message.author.id === client.config.main.botManagerRole || message.member.roles.cache.find(r => r.id === commandConfig.unlimitedTime[i])) {
                authorized = true;
                break;
            };
        };

        //Si no se permitió la ejecución, manda un mensaje de error
        if (!authorized && milliseconds > commandConfig.maxRegularTime) {
            let maxTimeEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} Solo puedes silenciar un máximo de \`${client.functions.msToHHMMSS(commandConfig.maxRegularTime)}\`.`);

            return message.channel.send({ embeds: [maxTimeEmbed] });
        };

        //Genera un mensaje de confirmación
        let successEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.orangeTick} **${member.user.tag}** ha sido silenciado, ¿alguien más?`);

        //Almacena la razón
        let toDeleteCount = command.length - 2 + args[0].length + 1 + args[1].length + 2; 
        let reason = message.content.slice(toDeleteCount);

        //Si se ha proporcionado razón, la adjunta al mensaje de confirmación
        if (reason) successEmbed.setDescription(`${client.customEmojis.orangeTick} **${member.user.tag}** ha sido silenciado debido a **${reason}**, ¿alguien más?`);

        //Esto comprueba si se ha proporcionado una razón
        if (!reason) reason = 'Indefinida';

        if (message.author.id !== client.homeGuild.ownerId) {
            let undefinedReasoneEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} Debes adjuntar una razón`);

            if (reason === 'Indefinida' && !authorized) return message.channel.send({ embeds: [undefinedReasoneEmbed] });
        };

        let loggingEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setAuthor({ name: `${member.user.tag} ha sido SILENCIADO`, iconURL: member.user.displayAvatarURL({dynamic: true}) })
            .addField('Miembro', member.user.tag, true)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason, true)
            .addField('Duración', args[1], true);

        let toDMEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setAuthor({ name: '[SILENCIADO]', iconURL: message.guild.iconURL({ dynamic: true}) })
            .setDescription(`<@${member.id}>, has sido silenciado en ${message.guild.name}`)
            .addField('Moderador', message.author.tag, true)
            .addField('Razón', reason, true)
            .addField('Duración', args[1], true);

        //Guarda en la base de datos
        client.db.mutes[member.id] = {
            time: Date.now() + milliseconds
        };

        client.fs.writeFile('./databases/mutes.json', JSON.stringify(client.db.mutes, null, 4), async err => {
            if (err) throw err;

            //Silencia al miembro
            member.roles.add(mutedRole);
            
            await message.channel.send({ embeds: [successEmbed] });
            await client.functions.loggingManager(loggingEmbed);
            await member.send({ embeds: [toDMEmbed] });
        });
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'tempmute',
    aliases: [],
    syntax: `tempmute <@member| id> <"seconds"S | "minutes"M | "hours"H | "days"D> [reason]`
};
