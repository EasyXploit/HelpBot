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

        //Función para cargar un rango de advertencias
        async function loadWarns(fromRange, toRange) {

            //Almacena la descripción del embed
            let board = '';

            //Por cada una de lps índices del rango
            for (let index = fromRange - 1; index < toRange; index++) {

                //Si no hay más advertencias, para el bucle
                if (!memberWarns[index]) break;

                //Almacena las claves de la advertencia
                let warn = Object.values(memberWarns[index])[0];

                //Busca y almacena el moderador que aplicó la sanción
                const moderator = await client.functions.utilities.fetch.run(client, 'member', warn.moderator) || locale.unknownModerator;

                //Añade una nueva fila con los detalles de la advertencia
                board += `\`${Object.keys(memberWarns[index])[0]}\` • ${moderator} • <t:${Math.round(new Date(parseInt(warn.timestamp)) / 1000)}>\n${warn.reason}\n\n`;
            };

            //Cuando acaba, devuelve la tabla
            return board;
        };

        //Función para cargar una página determinada
        async function loadEmbed(embed) {

            //Almacena la sanción actual, si aplica
            let sanction;

            //Comprueba qué tipo de sanción tiene el miembro (si la tiene, según duración)
            if (client.db.mutes[memberId] && client.db.mutes[memberId].until) sanction = `\`${locale.mutedUntil}:\` <t:${Math.round(new Date(client.db.mutes[memberId].until) / 1000)}>`;
            else if (client.db.mutes[memberId] && !client.db.mutes[memberId].until) sanction = `\`${locale.mutedUndefinetly}\``;

            //Genera el embed de las infracciones
            let infractionsEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.primary)
                .setTitle(`⚠ ${locale.infractionsEmbed.title}`)
                .setDescription(`${await client.functions.utilities.parseLocale.run(locale.infractionsEmbed.description, { member: member ? member.user.tag : `${memberId} (ID)`, sanction: sanction || `\`${locale.noMute}\`` })}.`)
                .addField(locale.infractionsEmbed.last24h, onDay.toString(), true)
                .addField(locale.infractionsEmbed.last7d, onWeek.toString(), true)
                .addField(locale.infractionsEmbed.total, total.toString(), true)
                .addField(locale.infractionsEmbed.list, total > 0 ? await loadWarns(10 * actualPage - 9, 10 * actualPage) : locale.infractionsEmbed.noList)
                .setFooter({ text: await client.functions.utilities.parseLocale.run(locale.infractionsEmbed.page, { actualPage: actualPage, totalPages: totalPages }), iconURL: client.homeGuild.iconURL({dynamic: true}) });

            //Si se encontró el miembro, muestra su avatar en el embed
            if (member) infractionsEmbed.setThumbnail(member.user.displayAvatarURL({dynamic: true}));

            //Comprueba si ha de editar o enviar el embed
            if (embed) await embed.edit({ embeds: [infractionsEmbed] }).then(async embed => { awaitReactions(embed) });
            else {
                const sentEmbed = await interaction.reply({ embeds: [infractionsEmbed], fetchReply: true });
                awaitReactions(sentEmbed);
            };
        };

        //Función para manejar el menú de reacciones
        async function awaitReactions(embed) {

            //Borra todas las reacciones previas (si tiene)
            if (embed.reactions) await embed.reactions.removeAll();

            //Reacciona con el menú correspondiente según la página
            if (actualPage > 1) await embed.react('⏮');
            if (actualPage > 1) await embed.react('◀');
            if (actualPage < totalPages) await embed.react('▶');
            if (actualPage < totalPages) await embed.react('⏭');

            //Crea el filtro de reacciones según la página
            const reactionsFilter = (reaction, user) => {

                //Crea un array de reacciones válidas
                let validReactions = [];

                //Si no es la primera página
                if (actualPage > 1) validReactions.push('⏮', '◀');

                //Si no es la última página
                if (actualPage < totalPages) validReactions.push('▶', '⏭');

                //Devuelve si el filtro encajó con la reacción
                return validReactions.includes(reaction.emoji.name) && user.id === interaction.member.id;
            };

            //Inicializa un listener de reaccciones en función del filtro
            embed.awaitReactions({ filter: reactionsFilter, max: 1, time: 60000, errors: ['time'] }).then(async collected => {

                //Almacena la primera reacción
                const reaction = collected.first();

                //Según el emoji reaccionado, actualiza el contador consecutivamente
                if (reaction.emoji.name === '⏮' && actualPage > 1) actualPage = 1;
                if (reaction.emoji.name === '◀' && actualPage > 1) actualPage = actualPage - 1;
                if (reaction.emoji.name === '▶' && actualPage < totalPages) actualPage = actualPage + 1;
                if (reaction.emoji.name === '⏭' && actualPage < totalPages) actualPage = totalPages;

                //Carga la nueva página
                loadEmbed(embed);

            //Si no se hace nada, borra las reacciones
            }).catch(() => embed.reactions.removeAll());
        };

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

        //Genera el primer embed
        loadEmbed();
        
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
