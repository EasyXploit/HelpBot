exports.run = async (client, message, args, command, commandConfig) => {
    
    try {

        //Devuelve un error si no se ha proporcionado un miembro objetivo
        if (!args[0] || !args[1]) return await client.functions.syntaxHandler(message.channel, commandConfig);

        //Busca al miembro proporcionado
        const member = await client.functions.fetchMember(message.guild, args[0]);

        //Devuelve un error si no se ha encontrado al miembro
        if (isNaN(args[0]) && !member) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Miembro no encontrado. Debes mencionar a un miembro o escribir su ID`)
        ]});

        //Almacena el ID del miembro
        const memberId = member ? member.id : args[0];

        //Devuelve un error si se ha proporcionado un bot
        if (member && member.user.bot) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Los bots no pueden ser advertidos`)
        ]});
        
        //Comprueba si se ha aportado alguna advertencia
        const warnID = args[1];

        //Almacena la razón
        let reason = args.splice(2).join(' ');

        //Capitaliza la razón
        if (reason) reason = `${reason.charAt(0).toUpperCase()}${reason.slice(1)}`;

        //Si no se ha proporcionado razón y el miembro no es el dueño
        if (!reason && message.author.id !== message.guild.ownerId) {

            //Almacena si el miembro puede omitir la razón
            let authorized;

            //Por cada uno de los roles que pueden omitir la razón
            for (let index = 0; index < commandConfig.reasonNotNeeded; index++) {

                //Comprueba si el miembro ejecutor lo tiene
                if (message.member.roles.cache.has(commandConfig.reasonNotNeeded[index])) {
                    authorized = true;
                    break;
                };
            };

            //Si no está autorizado, devuelve un mensaje de error
            if (!authorized) return message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} Debes proporcionar una razón`)
            ]});
        };
        
        //Se comprueba si el rol del miembro ejecutor es más bajo que el del miembro objetivo
        if (member && message.member.id !== message.guild.ownerId && message.member.roles.highest.position <= member.roles.highest.position) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${message.author}, no dispones de privilegios para realizar esta operación`)
        ]}).then(msg => { setTimeout(() => msg.delete(), 5000) });

        //Comprueba si el miembro tiene warns
        if (!client.db.warns[memberId]) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Este miembro no tiene advertencias`)
        ]});

        //Función para comprobar si el miembro puede borrar cualquier advertencia
        function checkIfCanRemoveAny() {

            //Almacena si el miembro puede borrar cualquiera
            let authorized;

            //Para cada ID de rol de la lista blanca
            for (let index = 0; index < commandConfig.removeAny.length; index++) {

                //Si se permite si el que invocó el comando es el dueño, o uno de los roles del miembro coincide con la lista blanca, entonces permite la ejecución
                if (message.author.id === message.guild.ownerId || message.author.id === client.config.main.botManagerRole || message.member.roles.cache.find(role => role.id === commandConfig.removeAny[index])) {
                    authorized = true;
                    break;
                };
            };

            //Devuelve el estado de autorización
            return authorized;
        };

        //Crear variables para almacenar los embeds a enviar
        let successEmbed, loggingEmbed, toDMEmbed;

        //Si hay que eliminar todas las infracciones
        if (warnID === 'all') {

            //Comprueba si el miembro puede eliminar cualquier advertencia
            if (!checkIfCanRemoveAny()) return message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${message.author}, no dispones de privilegios para realizar esta operación`)
            ]}).then(msg => { setTimeout(() => msg.delete(), 5000) });

            //Genera un mensaje para el canal de registros
            loggingEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.logging)
                .setTitle('📑 Registro - [INFRACCIONES]')
                .setDescription('Se han retirado todas las advertencias.')
                .addField('Fecha:', `<t:${Math.round(new Date() / 1000)}>`, true)
                .addField('Moderador:', message.author.tag, true)
                .addField('Miembro:', member ? member.user.tag : `${memberId} (ID)`, true)
                .addField('Razón:', reason || 'Indefinida', true);

            //Genera una notificación para el miembro
            if (member) toDMEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.correct)
                .setAuthor({ name: '[DES-ADVERTIDO]', iconURL: message.guild.iconURL({ dynamic: true}) })
                .setDescription(`${member}, se te han retirado todas la advertencias.`)
                .addField('Moderador', message.author.tag, true)
                .addField('Razón', reason || 'Indefinida', true);

            //Genera una notificación de la acción para el canal de invocación
            successEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.secondaryCorrect)
                .setDescription(`${client.customEmojis.greenTick} Se han retirado todas las advertencias al miembro **${member ? member.user.tag : `${memberId} (ID)`}**`);

            //Elimina la entrada de la base de datos
            delete client.db.warns[memberId];

        } else { //Si solo hay que eliminar una infracción

            //Comprueba si la advertencia existe en la BD
            if (!client.db.warns[memberId][warnID]) return message.channel.send({ embeds: [new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} No existe la advertencia con ID **${warnID}**`)
            ]});

            //Comprueba si puede borrar esta advertencia
            if (client.db.warns[memberId][warnID].moderator !== message.author.id && !checkIfCanRemoveAny()) return message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${message.author}, no dispones de privilegios para realizar esta operación`)
            ]}).then(msg => { setTimeout(() => msg.delete(), 5000) });

            //Genera un mensaje para el canal de registros
            loggingEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.logging)
                .setTitle('📑 Registro - [INFRACCIONES]')
                .setDescription('Se ha retirado una advertencia.')
                .addField('Fecha:', `<t:${Math.round(new Date() / 1000)}>`, true)
                .addField('Moderador:', message.author.tag, true)
                .addField('ID de advertencia:', warnID, true)
                .addField('Advertencia:', client.db.warns[memberId][warnID].reason, true)
                .addField('Miembro:', member ? member.user.tag : `${memberId} (ID)`, true)
                .addField('Razón:', reason || 'Indefinida', true);

            //Genera una notificación para el miembro
            if (member) toDMEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.correct)
                .setAuthor({ name: '[DES-ADVERTIDO]', iconURL: message.guild.iconURL({ dynamic: true}) })
                .setDescription(`${member}, se te ha retirado la advertencia con ID \`${warnID}\`.`)
                .addField('Moderador', message.author.tag, true)
                .addField('ID de advertencia:', warnID, true)
                .addField('Advertencia:', client.db.warns[memberId][warnID].reason, true)
                .addField('Razón', reason || 'Indefinida', true);

            //Genera una notificación de la acción para el canal de invocación
            successEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.secondaryCorrect)
                .setTitle(`${client.customEmojis.greenTick} Operación completada`)
                .setDescription(`Se ha retirado la advertencia con ID **${warnID}** al miembro **${member ? member.user.tag : `${memberId} (ID)`}**`);

            //Resta el warn indicado
            delete client.db.warns[memberId][warnID];
            
            //Si se queda en 0 warns, se borra la entrada del JSON
            if (Object.keys(client.db.warns[memberId]).length === 0) delete client.db.warns[memberId];
        };

        //Escribe el resultado en el JSON
        client.fs.writeFile('./databases/warns.json', JSON.stringify(client.db.warns, null, 4), async err => {

            //Si hubo un error, lo lanza a la consola
            if (err) throw err;

            //Envía un registro al canal de registros
            await client.functions.loggingManager('embed', loggingEmbed);

            //Envía un mensaje de confirmación al miembro
            if (member) await member.send({ embeds: [toDMEmbed] });

            //Envía una notificación de la acción en el canal de invocación
            await message.channel.send({ embeds: [successEmbed] });
        });
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'rmwarn',
    description: 'Para eliminar una advertencia (o todas) a un miembro.',
    aliases: ['pardon'],
    parameters: '<@miembro| id> <ID de advertencia | "all"> [razón]'
};
