exports.run = async (member, client, locale) => {
    
    try {

        //Aborta si no es un evento de la guild registrada
        if (member.guild.id !== client.baseGuild.id) return;

        //Si el miembro tiene un silenciamiento en vigor y se le debe retirar, o no lo tiene y se tiene que desregistrar
        if ((member.communicationDisabledUntilTimestamp && member.communicationDisabledUntilTimestamp > Date.now() && !client.db.timeouts[member.id]) || (!member.communicationDisabledUntilTimestamp && client.db.timeouts[member.id])) {

            //Habilita la comunicación del miembro en el servidor
            await member.disableCommunicationUntil(null, locale.communicationEnabled.reason);

            //Si tiene registrado el silenciamiento
            if (client.db.timeouts[member.id]) {

                //Elimina la entrada de la base de datos
                delete client.db.timeouts[member.id];

                //Sobreescribe el fichero de la base de datos con los cambios
                await client.fs.writeFile('./storage/databases/timeouts.json', JSON.stringify(client.db.timeouts, null, 4), async err => {

                    //Si hubo un error, lo lanza a la consola
                    if (err) throw err;
                });
            };
        };

        //Si el nuevo miembro es un bot
        if (member.user.bot) {

            //Almacena el ID del rol para nuevos bots
            const newBotRoleId = await client.functions.db.getConfig.run('welcomes.newBotRoleId');

            //Añade el rol de bienvenida para nuevos bots (si no lo tiene ya)
            if (!member.roles.cache.has(newBotRoleId)) await member.roles.add(newBotRoleId);

            //Envía un mensaje al canal de registro
            await client.functions.managers.logging.run(client, 'botJoined', 'embed', new client.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig.run('colors.logging')}`)
                .setTitle(`📑 ${locale.botLoggingEmbed.title}`)
                .setDescription(`${await client.functions.utilities.parseLocale.run(locale.botLoggingEmbed.description, { memberTag: member.user.tag })}.`)
            );

            //Aborta el resto del script
            return;
        };
        
        //Almacena el modo de manejo de nuevos miembros
        const newMemberMode = await client.functions.db.getConfig.run('welcomes.newMemberMode');

        //Ejecuta el manejador de nuevos miembros (si procede)
        if (newMemberMode === 0) await client.functions.managers.newMember.run(client, member);

    } catch (error) {

        //Invoca el manejador de errores
        await client.functions.managers.eventError.run(client, error);
    };
};
