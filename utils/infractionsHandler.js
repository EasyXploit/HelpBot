exports.run = async (client, message, guild, member, reason, action, moderator, msg) => {

    //Función para silenciar
    async function mute(time) {

        //Comprueba si existe el rol silenciado, sino lo crea
        const mutedRole = await client.functions.checkMutedRole(message.guild);

        //Comprueba si el miembro tiene el rol silenciado, sino se lo añade
        if (member.roles.cache.has(mutedRole.id)) return;
        member.roles.add(mutedRole);

        //Propaga el rol silenciado
        client.functions.spreadMutedRole(message.guild);

        if (time) {
            client.mutes[member.id] = {
                time: Date.now() + time
            };

            client.fs.writeFile('./databases/mutes.json', JSON.stringify(client.mutes, null, 4), async err => {
                if (err) throw err;
            });
        };

        let duration = Math.floor(time/(24000*1000*60*60)) + "d " + Math.floor(time/(1000*60*60)) + ":" + Math.floor(time/(1000*60))%60 + ":" + Math.floor(time/1000)%60 || '∞';

        let loggingEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setAuthor({ name: `${member.user.tag} ha sido SILENCIADO`, iconURL: member.user.displayAvatarURL({dynamic: true}) })
            .addField('Miembro', member.user.tag, true)
            .addField('Moderador', moderator.tag, true)
            .addField('Razón', 'Demasiadas advertencias', true)
            .addField('Duración', duration, true);

        let publicEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.OrangeTick} ${user.tag} ha sido silenciado por que acumuló demasiadas advertencias, ¿alguien más?`);

        let toDMEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setAuthor({ name: '[SILENCIADO]', iconURL: guild.iconURL({dynamic: true}) })
            .setDescription(`${member.user.tag}, has sido silenciado en ${guild.name}`)
            .addField('Moderador', moderator.tag, true)
            .addField('Razón', 'Demasiadas advertencias', true)
            .addField('Duración', duration, true);

        await client.functions.loggingManager(loggingEmbed);
        await message.channel.send({ embeds: [publicEmbed] });
        await member.send({ embeds: [toDMEmbed] });
    };

    //Función para expulsar
    async function kick() {
        let loggingEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setAuthor({ name: `${member.user.tag} ha sido EXPULSADO`, iconURL: member.user.displayAvatarURL({dynamic: true}) })
            .addField('Miembro', member.user.tag, true)
            .addField('Moderador', moderator.tag, true)
            .addField('Razón', 'Demasiadas advertencias', true);

        let publicEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.OrangeTick} ${user.tag} ha sido expulsado por que acumuló demasiadas advertencias, ¿alguien más?`);

        let toDMEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setAuthor({ name: '[EXPULSADO]', iconURL: guild.iconURL({dynamic: true}) })
            .setDescription(`<@${member.id}>, has sido expulsado en ${guild.name}`)
            .addField(`Moderador`, moderator.tag, true)
            .addField(`Razón`, 'Demasiadas advertencias', true)

        await client.functions.loggingManager(loggingEmbed);
        await message.channel.send({ embeds: [publicEmbed] });
        await member.send({ embeds: [toDMEmbed] });

        await member.kick(reason);
    };

    //Función para banear
    async function ban(time) {

        if (time) {
            client.bans[user.id] = {
                time: Date.now() + time
            }
    
            client.fs.writeFile(`./databases/bans.json`, JSON.stringify(client.bans, null, 4), async err => {
                if (err) throw err;
            });
        };

        let loggingEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setAuthor({ name: `${member.user.tag} ha sido BANEADO`, iconURL: user.displayAvatarURL({dynamic: true}) })
            .addField(`Miembro`, member.user.tag, true)
            .addField(`ID`, member.id, true)
            .addField(`Moderador`, moderator.tag, true)
            .addField(`Razón`, 'Demasiadas advertencias', true)
            .addField(`Duración`, new Date(parseInt(time)).toLocaleString() || '∞', true);

        let publicEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.OrangeTick} ${user.tag} ha sido baneado por que acumuló demasiadas advertencias, ¿alguien más?`);

        let toDMEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setAuthor({ name: '[BANEADO]', iconURL: message.guild.iconURL({ dynamic: true}) })
            .setDescription(`<@${user.id}>, has sido baneado en ${message.guild.name}`)
            .addField(`Moderador`, moderator.tag, true)
            .addField(`Razón`, 'Demasiadas advertencias', true)
            .addField(`Duración`, new Date(parseInt(time)).toLocaleString() || '∞', true);

        await client.functions.loggingManager(loggingEmbed);
        await message.channel.send({ embeds: [publicEmbed] });
        await member.send({ embeds: [toDMEmbed] });

        await guild.members.ban(user, {reason: `Moderador: ${moderator.id}, Razón: Demasiadas advertencias`});

    };

    //Capitaliza la razón de la advertencia
    const warnReason = `${reason.charAt(0).toUpperCase()}${reason.slice(1)}`;

    //Envía un mensaje de advertencia
    let publicWarnEmbed = new client.MessageEmbed()
        .setColor(client.config.colors.warning)
        .setDescription(`${client.customEmojis.orangeTick} El miembro **${member.user.tag}** ha sido advertido debido a **${warnReason}**.`);

    let toDMEmbed = new client.MessageEmbed()
        .setColor(client.config.colors.warning)
        .setAuthor({ name: '[ADVERTIDO]', iconURL: guild.iconURL({dynamic: true}) })
        .setDescription(`<@${member.id}>, has sido advertido en ${guild.name}`)
        .addField(`Moderador`, moderator.tag, true)
        .addField(`Razón`, warnReason, true);

    await message.channel.send({ embeds: [publicWarnEmbed] });
    await member.send({ embeds: [toDMEmbed] });

    //LEYENDA DE ACCIONES: 1 = borrar; 2 = advertir; 3 = borrar y advertir
    if (action === 1 || action === 3) { //Borra el mensaje si se ha de hacer
        if (message.deletable) message.delete();
    }

    if (action === 2 || action === 3) { //Advierte si se ha de hacer

        //Añade una nueva infracción para el miembro
        if (!client.warns[member.id]) client.warns[member.id] = {};

        const warnID = client.functions.sidGenerator();
        
        client.warns[member.id][warnID] = {
            timestamp: Date.now(),
            reason: warnReason,
            moderator: moderator.id
        };

        client.fs.writeFile(`./databases/warns.json`, JSON.stringify(client.warns, null, 4), async err => {
            if (err) throw err;

            let loggingEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.warning)
                .setAuthor({ name: `${member.user.tag} ha sido ADVERTIDO`, iconURL: member.user.displayAvatarURL({dynamic: true}) })
                .addField(`Miembro`, member.user.tag, true)
                .addField(`Moderador`, moderator.tag, true)
                .addField(`Razón`, warnReason, true)
                .addField(`ID de Advertencia`, warnID, true)
                .addField(`Canal`, `<#${message.channel.id}>`, true)
                .addField('Infracciones', (Object.keys(client.warns[member.id]).length).toString(), true);

            await client.functions.loggingManager(loggingEmbed);

            //Si procede, adjunta el mensaje filtrado
            if (msg) client.loggingChannel.send({ embeds: [new discord.MessageAttachment(Buffer.from(`CONTENIDO DEL MENSAJE: \n${msg}`, 'utf-8'), `mensaje-filtrado-${Date.now()}.txt`)] })
        });

        for (let i = 0; i < client.config.automodRules.length; i++) {
            let rule = client.config.automodRules[i];
            let warnsCount = 0;

            Object.keys(client.warns[member.id]).forEach(entry => {
                if (Date.now() - entry.timestamp <= rule.age) warnsCount++
            });

            if (warnsCount >= rule.quantity) {
                switch (rule.action) {
                    case 'tempmute': mute(rule.duration); break;
                    case 'mute': mute(); break;
                    case 'kick': kick(); break;
                    case 'tempban': ban(rule.duration); break;
                    case 'ban': ban(); break;
                };
                break;
            };
        };
    };
};
