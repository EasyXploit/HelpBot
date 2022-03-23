exports.run = async (client, message, member, reason, action, moderator, msg) => {

    //Función para silenciar
    async function mute(time) {

        //Comprueba si existe el rol silenciado, sino lo crea
        const mutedRole = await client.functions.checkMutedRole(client.homeGuild);

        //Comprueba si el miembro tiene el rol silenciado, sino se lo añade
        if (member.roles.cache.has(mutedRole.id)) return;
        member.roles.add(mutedRole);

        //Propaga el rol silenciado
        client.functions.spreadMutedRole(client.homeGuild);

        if (time) {
            client.db.mutes[member.id] = {
                time: Date.now() + time
            };

            client.fs.writeFile('./databases/mutes.json', JSON.stringify(client.db.mutes, null, 4), async err => {
                if (err) throw err;
            });
        };

        let duration = `${Math.floor(time/(24000*1000*60*60))}d ${Math.floor(time/(1000*60*60))}:${Math.floor(time/(1000*60))%60}:${Math.floor(time/1000)%60}` || '∞';

        let loggingEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setAuthor({ name: `${member.user.tag} ha sido SILENCIADO`, iconURL: member.user.displayAvatarURL({dynamic: true}) })
            .addField('Miembro', member.user.tag, true)
            .addField('Moderador', moderator.tag, true)
            .addField('Razón', 'Demasiadas advertencias', true)
            .addField('Duración', duration, true);

        let publicEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.orangeTick} **${member.user.tag}** ha sido silenciado por que acumuló __demasiadas advertencias__, ¿alguien más?`);

        let toDMEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setAuthor({ name: '[SILENCIADO]', iconURL: client.homeGuild.iconURL({dynamic: true}) })
            .setDescription(`${member.user.tag}, has sido silenciado en ${client.homeGuild.name}`)
            .addField('Moderador', moderator.tag, true)
            .addField('Razón', 'Demasiadas advertencias', true)
            .addField('Duración', duration, true);

        await client.functions.loggingManager('embed', loggingEmbed);
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
            .setDescription(`${client.customEmojis.orangeTick} ${member.user.tag} ha sido expulsado por que acumuló demasiadas advertencias, ¿alguien más?`);

        let toDMEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setAuthor({ name: '[EXPULSADO]', iconURL: client.homeGuild.iconURL({dynamic: true}) })
            .setDescription(`<@${member.id}>, has sido expulsado en ${client.homeGuild.name}`)
            .addField(`Moderador`, moderator.tag, true)
            .addField(`Razón`, 'Demasiadas advertencias', true)

        await client.functions.loggingManager('embed', loggingEmbed);
        await message.channel.send({ embeds: [publicEmbed] });
        await member.send({ embeds: [toDMEmbed] });

        await member.kick(reason);
    };

    //Función para banear
    async function ban(time) {

        if (time) {
            client.db.bans[member.user.id] = {
                time: Date.now() + time
            }
    
            client.fs.writeFile(`./databases/bans.json`, JSON.stringify(client.db.bans, null, 4), async err => {
                if (err) throw err;
            });
        };

        let loggingEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setAuthor({ name: `${member.user.tag} ha sido BANEADO`, iconURL: member.user.displayAvatarURL({dynamic: true}) })
            .addField(`Miembro`, member.user.tag, true)
            .addField(`ID`, member.id, true)
            .addField(`Moderador`, moderator.tag, true)
            .addField(`Razón`, 'Demasiadas advertencias', true)
            .addField(`Vencimiento`, `<t:${Math.round(new Date(parseInt(time)) / 1000)}:R>` || 'No vence', true);

        let publicEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.orangeTick} ${member.user.tag} ha sido baneado por que acumuló demasiadas advertencias, ¿alguien más?`);

        let toDMEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setAuthor({ name: '[BANEADO]', iconURL: client.homeGuild.iconURL({ dynamic: true}) })
            .setDescription(`<@${member.user.id}>, has sido baneado en ${client.homeGuild.name}`)
            .addField(`Moderador`, moderator.tag, true)
            .addField(`Razón`, 'Demasiadas advertencias', true)
            .addField(`Vencimiento`, `<t:${Math.round(new Date(parseInt(time)) / 1000)}:R>` || 'No vence', true);

        await client.functions.loggingManager('embed', loggingEmbed);
        await message.channel.send({ embeds: [publicEmbed] });
        await member.send({ embeds: [toDMEmbed] });

        await client.homeGuild.members.ban(member.user, {reason: `Moderador: ${moderator.id}, Razón: Demasiadas advertencias`});

    };

    //Capitaliza la razón de la advertencia
    const warnReason = `${reason.charAt(0).toUpperCase()}${reason.slice(1)}`;

    //Envía un mensaje de advertencia
    let publicWarnEmbed = new client.MessageEmbed()
        .setColor(client.config.colors.warning)
        .setDescription(`${client.customEmojis.orangeTick} El miembro **${member.user.tag}** ha sido advertido debido a **${warnReason}**.`);

    let toDMEmbed = new client.MessageEmbed()
        .setColor(client.config.colors.warning)
        .setAuthor({ name: '[ADVERTIDO]', iconURL: client.homeGuild.iconURL({dynamic: true}) })
        .setDescription(`<@${member.id}>, has sido advertido en ${client.homeGuild.name}`)
        .addField(`Moderador`, moderator.tag, true)
        .addField(`Razón`, warnReason, true);

    if (message.channel.type !== 'DM') await message.channel.send({ embeds: [publicWarnEmbed] });
    await member.send({ embeds: [toDMEmbed] });

    //LEYENDA DE ACCIONES: 1 = borrar; 2 = advertir; 3 = borrar y advertir
    if (action === 1 || action === 3) { //Borra el mensaje si se ha de hacer
        if (message.deletable) message.delete();
    };

    if (action === 2 || action === 3) { //Advierte si se ha de hacer

        //Añade una nueva infracción para el miembro
        if (!client.db.warns[member.id]) client.db.warns[member.id] = {};

        const warnID = client.functions.sidGenerator();
        
        client.db.warns[member.id][warnID] = {
            timestamp: Date.now(),
            reason: warnReason,
            moderator: moderator.id
        };

        client.fs.writeFile(`./databases/warns.json`, JSON.stringify(client.db.warns, null, 4), async err => {
            if (err) throw err;

            let loggingEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.warning)
                .setAuthor({ name: `${member.user.tag} ha sido ADVERTIDO`, iconURL: member.user.displayAvatarURL({dynamic: true}) })
                .addField(`Miembro`, member.user.tag, true)
                .addField(`Moderador`, moderator.tag, true)
                .addField(`Razón`, warnReason, true)
                .addField(`ID de Advertencia`, warnID, true)
                .addField(`Canal`, `<#${message.channel.id}>`, true)
                .addField('Infracciones', (Object.keys(client.db.warns[member.id]).length).toString(), true);

            await client.functions.loggingManager('embed', loggingEmbed);

            //Si procede, adjunta el mensaje filtrado
            if (msg) client.functions.loggingManager('file', new client.MessageAttachment(Buffer.from(`CONTENIDO DEL MENSAJE: \n${msg}`, 'utf-8'), `mensaje-filtrado-${Date.now()}.txt`));
        });

        //Banea temporalmente a los miembros que se acaban de unir al servidor y han mandado invitaciones
        if (message.channel.type === 'DM' && (member.joinedTimestamp + client.config.moderation.newMemberTimeDelimiter) < Date.now()) {
            client.db.bans[member.id] = {
                time: Date.now() + client.config.moderation.newSpammerMemberBanDuration
            };

            return ban(client.config.moderation.newSpammerMemberBanDuration);
        };

        for (let index = 0; index < client.config.automodRules.length; index++) {
            let rule = client.config.automodRules[index];
            let warnsCount = 0;

            Object.keys(client.db.warns[member.id]).forEach(entry => {

                if (Date.now() - client.db.warns[member.id][entry].timestamp <= rule.age) warnsCount++;
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
