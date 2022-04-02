exports.run = async (client, message, member, reason, action, moderator, msg) => {

    try {

        //Función para silenciar
        async function mute(time) {

            //Comprueba si existe el rol silenciado, sino lo crea
            const mutedRole = await client.functions.checkMutedRole(client.homeGuild);

            //Comprueba si el miembro ya tenía el rol silenciado
            if (member.roles.cache.has(mutedRole.id)) return;

            //Añade el rol silenciado al miembro
            member.roles.add(mutedRole);

            //Propaga el rol silenciado por todos los canales
            client.functions.spreadMutedRole(client.homeGuild);

            //Si se especificó una duración limitada
            if (time) {

                //Almacena el silenciamiento en la BD
                client.db.mutes[member.id] = {
                    time: Date.now() + time
                };

                //Sobreescribe el fichero de BD
                client.fs.writeFile('./databases/mutes.json', JSON.stringify(client.db.mutes, null, 4), async err => {

                    //Si hubo algún error, lo lanza por consola
                    if (err) throw err;
                });
            };

            //Envía un mensaje al canal de registro
            await client.functions.loggingManager('embed', new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setAuthor({ name: `${member.user.tag} ha sido SILENCIADO`, iconURL: member.user.displayAvatarURL({dynamic: true}) })
                .addField('Miembro', member.user.tag, true)
                .addField('Moderador', moderator.tag, true)
                .addField('Razón', 'Demasiadas advertencias', true)
                .addField('Vencimiento', time ? `<t:${Math.round(new Date(parseInt(time)) / 1000)}:R>` : 'No vence', true)
            );

            //Envía un mensaje al canal de la infracción
            await message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.warning)
                .setDescription(`${client.customEmojis.orangeTick} **${member.user.tag}** ha sido silenciado por que acumuló __demasiadas advertencias__, ¿alguien más?`)
            ]});

            //Envía un mensaje al miembro
            await member.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setAuthor({ name: '[SILENCIADO]', iconURL: client.homeGuild.iconURL({dynamic: true}) })
                .setDescription(`${member.user.tag}, has sido silenciado en ${client.homeGuild.name}`)
                .addField('Moderador', moderator.tag, true)
                .addField('Razón', 'Demasiadas advertencias', true)
                .addField('Vencimiento', time ? `<t:${Math.round(new Date(parseInt(time)) / 1000)}:R>` : 'No vence', true)
            ]});
        };

        //Función para expulsar
        async function kick() {

            //Envía un mensaje al canal de registro
            await client.functions.loggingManager('embed', new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setAuthor({ name: `${member.user.tag} ha sido EXPULSADO`, iconURL: member.user.displayAvatarURL({dynamic: true}) })
                .addField('Miembro', member.user.tag, true)
                .addField('Moderador', moderator.tag, true)
                .addField('Razón', 'Demasiadas advertencias', true)
            );

            //Envía un mensaje al canal de la infracción
            await message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.warning)
                .setDescription(`${client.customEmojis.orangeTick} ${member.user.tag} ha sido expulsado por que acumuló demasiadas advertencias, ¿alguien más?`)
            ]});

            //Envía un mensaje al miembro
            await member.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setAuthor({ name: '[EXPULSADO]', iconURL: client.homeGuild.iconURL({dynamic: true}) })
                .setDescription(`<@${member.id}>, has sido expulsado en ${client.homeGuild.name}`)
                .addField('Moderador', moderator.tag, true)
                .addField('Razón', 'Demasiadas advertencias', true)
            ]});

            //Expulsa al miembro
            await member.kick(reason);
        };

        //Función para banear
        async function ban(time) {

            //Si se especificó una duración limitada
            if (time) {

                //Almacena el baneo en la BD
                client.db.bans[member.user.id] = {
                    time: Date.now() + time
                };
        
                //Sobreescribe el fichero de BD
                client.fs.writeFile('./databases/bans.json', JSON.stringify(client.db.bans, null, 4), async err => {

                    //Si hubo algún error, lo lanza por consola
                    if (err) throw err;
                });
            };

            //Envía un mensaje al canal de la infracción
            await message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.warning)
                .setDescription(`${client.customEmojis.orangeTick} ${member.user.tag} ha sido baneado por que acumuló demasiadas advertencias, ¿alguien más?`)
            ]});

            //Envía un mensaje al miembro
            await member.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setAuthor({ name: '[BANEADO]', iconURL: client.homeGuild.iconURL({ dynamic: true}) })
                .setDescription(`<@${member.user.id}>, has sido baneado en ${client.homeGuild.name}`)
                .addField('Moderador', moderator.tag, true)
                .addField('Razón', 'Demasiadas advertencias', true)
                .addField('Vencimiento', time ? `<t:${Math.round(new Date(parseInt(Date.now() + time)) / 1000)}:R>` : 'No vence', true)
            ]});

            //Banea al miembro
            await client.homeGuild.members.ban(member.user, {reason: `Moderador: ${moderator.id}${time ? `, Vencimiento: ${Date.now() + time}` : ''}, Razón: Demasiadas advertencias`});
        };

        //Capitaliza la razón de la advertencia
        const warnReason = `${reason.charAt(0).toUpperCase()}${reason.slice(1)}`;

        //Envía un mensaje de advertencia al miembro por MD
        await member.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setAuthor({ name: '[ADVERTIDO]', iconURL: client.homeGuild.iconURL({dynamic: true}) })
            .setDescription(`<@${member.id}>, has sido advertido en ${client.homeGuild.name}`)
            .addField('Moderador', moderator.tag, true)
            .addField('Razón', warnReason, true)
        ]});

        //Envía un mensaje de advertencia
        if (message.channel.type !== 'DM') await message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.orangeTick} El miembro **${member.user.tag}** ha sido advertido debido a **${warnReason}**.`)
        ]});

        //Borra el mensaje si se ha de hacer
        if (action === 1 || action === 3) if (message.deletable) message.delete();

        //Advierte si se ha de hacer
        if (action === 2 || action === 3) {

            //Añade una nueva tabla de infracciones para el miembro
            if (!client.db.warns[member.id]) client.db.warns[member.id] = {};

            //Genera un ID para la infracción
            const warnID = client.functions.sidGenerator();
            
            //Graba la infracción en la base de datos
            client.db.warns[member.id][warnID] = {
                timestamp: Date.now(),
                reason: warnReason,
                moderator: moderator.id
            };

            //Sobreescribe la base de datos con los nuevos datos
            client.fs.writeFile('./databases/warns.json', JSON.stringify(client.db.warns, null, 4), async err => {

                //Si ocurrió un error, lo lanza a la consola
                if (err) throw err;

                //Ejecuta el manejador de registro
                await client.functions.loggingManager('embed', new client.MessageEmbed()
                    .setColor(client.config.colors.warning)
                    .setAuthor({ name: `${member.user.tag} ha sido ADVERTIDO`, iconURL: member.user.displayAvatarURL({dynamic: true}) })
                    .addField('Miembro', member.user.tag, true)
                    .addField('Moderador', moderator.tag, true)
                    .addField('Razón', warnReason, true)
                    .addField('ID de Advertencia', warnID, true)
                    .addField('Canal', `<#${message.channel.id}>`, true)
                    .addField('Infracciones', (Object.keys(client.db.warns[member.id]).length).toString(), true)
                );

                //Si procede, adjunta el mensaje filtrado
                if (msg && client.config.moderation.attachFilteredMessages) client.functions.loggingManager('file', new client.MessageAttachment(Buffer.from(`CONTENIDO DEL MENSAJE: \n${msg}`, 'utf-8'), `mensaje-filtrado-${Date.now()}.txt`));
            });

            //Banea temporalmente a los miembros que se acaban de unir al servidor y han mandado invitaciones
            if (message.channel.type === 'DM' && (member.joinedTimestamp + client.config.moderation.newMemberTimeDelimiter) < Date.now()) {

                //Ejecuta la función de baneo
                return ban(client.config.moderation.newSpammerMemberBanDuration);
            };

            //Por cada una de las reglas de automoderación
            for (const rule of client.config.automodRules) {

                //Almacena el conteo de infracciones
                let warnsCount = 0;

                //Por cada una de las infracciones del miembro
                Object.keys(client.db.warns[member.id]).forEach(entry => {

                    //Si no este supera el umbral de edad de la regla, lo añade al recuento
                    if (Date.now() - client.db.warns[member.id][entry].timestamp <= rule.age) warnsCount++;
                });

                //Si se iguala o excede la cantidad máxima de la regla
                if (warnsCount >= rule.quantity) {

                    //Ejecuta la acción de moderación que corresponda
                    switch (rule.action) {
                        case 'tempmute':    mute(rule.duration);    break;
                        case 'mute':        mute();                 break;
                        case 'kick':        kick();                 break;
                        case 'tempban':     ban(rule.duration);     break;
                        case 'ban':         ban();                  break;
                    };

                    //Aborta en cuanto se haya ejecutado
                    break;
                };
            };
        };
        
    } catch (error) {

        //Envía un mensaje de error a la consola
        console.error(`${new Date().toLocaleString()} 》ERROR:`, error.stack);
    };
};
