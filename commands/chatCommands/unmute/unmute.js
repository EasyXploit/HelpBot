exports.run = async (client, interaction, commandConfig, locale) => {
    
    try {

        //Busca al miembro proporcionado
        const member = await client.functions.fetchMember(interaction.options._hoistedOptions[0].value);

        //Almacena el ID del miembro
        const memberId = member ? member.id : interaction.options._hoistedOptions[0].value;

        //Almacena la razón
        let reason = interaction.options._hoistedOptions[1] ? interaction.options._hoistedOptions[1].value : null;

        //Capitaliza la razón
        if (reason) reason = `${reason.charAt(0).toUpperCase()}${reason.slice(1)}`;

        //Si no se ha proporcionado razón y el miembro no es el dueño
        if (!reason && interaction.member.id !== interaction.guild.ownerId) {

            //Almacena si el miembro puede omitir la razón
            let authorized;

            //Por cada uno de los roles que pueden omitir la razón
            for (let index = 0; index < commandConfig.reasonNotNeeded; index++) {

                //Comprueba si el miembro ejecutor lo tiene
                if (interaction.member.roles.cache.has(commandConfig.reasonNotNeeded[index])) {
                    authorized = true;
                    break;
                };
            };

            //Si no está autorizado, devuelve un mensaje de error
            if (!authorized) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.noReason}.`)
            ], ephemeral: true});
        };

        //Comprueba si existe el rol silenciado, sino lo crea
        const mutedRole = await client.functions.checkMutedRole(interaction.guild);

        //Comprueba si el miembro no estaba silenciado
        if (member && !member.roles.cache.has(mutedRole.id)) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.notSilenced}.`)
        ], ephemeral: true});

        //Crea una copia de los roles del miembro
        let newRolesCollection = member.roles.cache.clone();

        //Elimina el rol silenciado de la copia de roles
        newRolesCollection.delete(mutedRole.id);

        //Crea un array para almacenar los roles ordenados por posición
        let sortedRoles = [];

        //Por cada uno de los IDs de roles del miembro
        for (const key of newRolesCollection) {   
            
            //Obtiene el rol en base al ID
            const role = newRolesCollection.get(key[0]);
            
            //Sube al array de roles ordenados, un objeto con la propiedades deseadas
            sortedRoles.push({
                roleId: role.id,
                position: role.rawPosition,
            });
        };

        //Función para comprar un array
        function compare(a, b) {
            if (a.position < b.position) return 1;
            if (a.position > b.position) return -1;
            return 0;
        };

        //Compara y ordena el array de roles
        sortedRoles.sort(compare);

        //Se comprueba si el rol del miembro ejecutor es más bajo que el del miembro objetivo
        if (member && interaction.member.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= sortedRoles[0].position) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${client.functions.localeParser(locale.badHierarchy, { interactionAuthor: interaction.member })}.`)
        ], ephemeral: true});

        //Función para comprobar si el miembro puede borrar cualquier advertencia
        function checkIfCanRemoveAny() {

            //Almacena si el miembro puede borrar cualquier muteo
            let authorized;

            //Para cada ID de rol de la lista blanca
            for (let index = 0; index < commandConfig.removeAny.length; index++) {

                //Si se permite si el que invocó el comando es el dueño, o uno de los roles del miembro coincide con la lista blanca, entonces permite la ejecución
                if (interaction.member.id === interaction.guild.ownerId || interaction.member.roles.cache.find(role => role.id === client.config.main.botManagerRole) || interaction.member.roles.cache.find(role => role.id === commandConfig.removeAny[index])) {
                    authorized = true;
                    break;
                };
            };

            //Devuelve el estado de autorización
            return authorized;
        };

        //Devuelve el estado de autorización
        if (client.db.mutes[memberId].moderator !== interaction.member.id && !checkIfCanRemoveAny()) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${client.functions.localeParser(locale.cantRemoveAny, { interactionAuthor: interaction.member })}.`)
        ], ephemeral: true});

        //Elimina el rol silenciado al miembro
        if (member) await member.roles.remove(mutedRole);
        
        //Si el silenciamiento estaba registrado en la base de datos
        if (client.db.mutes.hasOwnProperty(memberId)) {

            //Elimina la entrada de la base de datos
            delete client.db.mutes[memberId];

            //Sobreescribe el fichero de la base de datos con los cambios
            await client.fs.writeFile('./databases/mutes.json', JSON.stringify(client.db.mutes), async err => {

                //Si hubo un error, lo lanza a la consola
                if (err) throw err;
            });
        };

        //Almacena el campo de autor del embed de registro
        let loggingEmbedAuthor = { name: client.functions.localeParser(locale.loggingEmbed.author, { userTag: member ? member.user.tag : locale.loggingEmbed.unknownAuthor })};

        //Si se especificó un miembro, añade su avatar al embed
        if (member) loggingEmbedAuthor.iconURL = member.user.displayAvatarURL({dynamic: true});

        //Envía un mensaje al canal de registros
        await client.functions.loggingManager('embed', new client.MessageEmbed()
            .setColor(client.config.colors.correct)
            .setAuthor(loggingEmbedAuthor )
            .addField(locale.loggingEmbed.memberId, memberId.toString(), true)
            .addField(locale.loggingEmbed.moderator, interaction.user.tag, true)
            .addField(locale.loggingEmbed.reason, reason || locale.undefinedReason, true)
        );

        //Envía una notificación al miembro
        if (member) await member.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.correct)
            .setAuthor({ name: locale.privateEmbed.author, iconURL: interaction.guild.iconURL({ dynamic: true}) })
            .setDescription(client.functions.localeParser(locale.privateEmbed.description, { member: member, guildName: interaction.guild.name }))
            .addField(locale.privateEmbed.moderator, interaction.user.tag, true)
            .addField(locale.privateEmbed.reason, reason || locale.undefinedReason, true)
        ]});

        //Notifica la acción en el canal de invocación
        await interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryCorrect)
            .setTitle(`${client.customEmojis.greenTick} ${locale.notificationEmbed.title}`)
            .setDescription(client.functions.localeParser(locale.notificationEmbed.description, { member: member ? member.user.tag : `${memberId} (ID)` }))
        ]});
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.interactionErrorHandler(error, interaction);
    };
};

module.exports.config = {
    type: 'guild',
    defaultPermission: false,
    appData: {
        type: 'CHAT_INPUT',
        options: [
            {
                optionName: 'user',
                type: 'USER',
                required: true
            },
            {
                optionName: 'reason',
                type: 'STRING',
                required: false
            }
        ]
    }
};
