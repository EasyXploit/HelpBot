exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Busca el miembro en cuestión
        const member = interaction.options._hoistedOptions[0] ? await client.functions.utilities.fetch.run(client, 'member', interaction.options._hoistedOptions[0].value || interaction.member.id): null;

        //Almacena el ID del miembro
        const memberId = member ? interaction.options._hoistedOptions[0].value : interaction.member.id;

        //Comprueba, si corresponde, que el miembro tenga permiso para ver el historial de otros
        if (interaction.member.id !== memberId) {

            //Variable para saber si está autorizado
            const authorized = await client.functions.utilities.checkAuthorization.run(client, interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.canSeeAny});

            //Si no se permitió la ejecución, manda un mensaje de error
            if (!authorized) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.nonPrivileged, { interactionAuthor: interaction.member })}.`)
            ], ephemeral: true});
        };

        //Comprueba si se trata de un bot
        if (member && member.user.bot) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.noBots}.`)
        ], ephemeral: true});

        //Almacena la página actual
        let actualPage = 1, totalPages = 1;

        //Almacena el total de sanciones, en 1 día y 1 semana, y las páginas totales
        let onDay = 0, onWeek = 0, total = 0;

        //Almacena las advertencias del miembro
        let memberWarns = client.db.warns[memberId];

        //Si el miembro tenía advertencias
        if (client.db.warns[memberId]) {

            //Mapea las advertencias del miembro
            memberWarns = Object.entries(client.db.warns[memberId]).reverse().map((warn) => ({ [warn[0]]: warn[1] }));

            //Almacena el total de ellas
            total = memberWarns.length

            //Almacena el total de páginas
            totalPages = Math.ceil(memberWarns.length / 10);

            //Por cada advertencia del miembro
            Object.values(memberWarns).forEach(warn => {

                //
                const warnId = Object.keys(warn)[0];

                //
                const warnData = warn[warnId];

                //Si ocurrió en un día o menos, lo contabiliza
                if ((Date.now() - warnData.timestamp) <= 86400000) onDay++;

                //Si ocurrió en una semana o menos, lo contabiliza
                if ((Date.now() - warnData.timestamp) <= 604800000) onWeek++;
            });
        };

        //Almacena la última interacción del comando
        let latestInteraction;
        
        do {

            //Almacena el primer índice del rango de páginas
            const fromRange = 10 * actualPage - 9;

            //Almacena el último índice del rango de páginas
            const toRange = 10 * actualPage;

            //Almacena la lista de advertencias
            let board = '';

            //Por cada una de los índices del rango
            if (memberWarns) for (let index = fromRange - 1; index < toRange; index++) {

                //Si no hay más advertencias, para el bucle
                if (!memberWarns[index]) break;

                //Almacena las claves de la advertencia
                let warn = Object.values(memberWarns[index])[0];

                //Busca y almacena el moderador que aplicó la sanción
                const moderator = await client.functions.utilities.fetch.run(client, 'member', warn.moderator) || locale.unknownModerator;

                //Añade una nueva fila con los detalles de la advertencia
                board += `\`${Object.keys(memberWarns[index])[0]}\` • ${moderator} • <t:${Math.round(new Date(parseInt(warn.timestamp)) / 1000)}>\n${warn.reason}\n\n`;
            };

            //Almacena la sanción actual, si aplica
            let sanction;

            //Comprueba qué tipo de sanción tiene el miembro (si la tiene, según duración)
            if (client.db.mutes[memberId] && client.db.mutes[memberId].until) sanction = `\`${locale.mutedUntil}:\` <t:${Math.round(new Date(client.db.mutes[memberId].until) / 1000)}>`;
            else if (client.db.mutes[memberId] && !client.db.mutes[memberId].until) sanction = `\`${locale.mutedUndefinetly}\``;

            //Genera el embed de las infracciones
            let newPageEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.primary)
                .setTitle(`⚠ ${locale.infractionsEmbed.title}`)
                .setDescription(`${await client.functions.utilities.parseLocale.run(locale.infractionsEmbed.description, { member: member ? member.user.tag : `${memberId} (ID)`, sanction: sanction || `\`${locale.noMute}\`` })}.`)
                .addField(locale.infractionsEmbed.last24h, onDay.toString(), true)
                .addField(locale.infractionsEmbed.last7d, onWeek.toString(), true)
                .addField(locale.infractionsEmbed.total, total.toString(), true)
                .addField(locale.infractionsEmbed.list, total > 0 ? board : locale.infractionsEmbed.noList)
                .setFooter({ text: await client.functions.utilities.parseLocale.run(locale.infractionsEmbed.page, { actualPage: actualPage, totalPages: totalPages }), iconURL: client.homeGuild.iconURL({dynamic: true}) });

            //Si se encontró el miembro, muestra su avatar en el embed
            if (member) newPageEmbed.setThumbnail(member.user.displayAvatarURL({dynamic: true}));

            //Invoca el gestor de navegación mediante botones
            const buttonNavigationResult = await client.functions.managers.buttonNavigation.run(client, interaction, 'infractions', actualPage, totalPages, newPageEmbed, latestInteraction);

            //Almacena la última interacción
            latestInteraction = buttonNavigationResult.latestInteraction;

            //Almacena la nueva página actual
            actualPage = buttonNavigationResult.newActualPage;

        //Mientras no se deba abortar por inactividad, continuará el bucle
        } while (actualPage !== false);

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError.run(client, error, interaction);
    };
};

module.exports.config = {
    type: 'guild',
    defaultPermission: true,
    appData: {
        type: 'CHAT_INPUT',
        options: [
            {
                optionName: 'user',
                type: 'USER',
                required: false
            }
        ]
    }
};
