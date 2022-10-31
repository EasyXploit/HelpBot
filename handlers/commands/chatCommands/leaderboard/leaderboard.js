exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Devuelve un error si no hay tabla de clasificación
        if (!client.db.stats || !Object.keys(client.db.stats).length) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.noLeaderboard}.`)
        ], ephemeral: true});

        //Almacena el tipo de clasifición a mostrar, si se proporciona
        const typeOption = interaction.options._hoistedOptions.find(prop => prop.name === locale.appData.options.type.name);
        const type = typeOption ? typeOption.value : 'experience';

        //Almacena las entradas de la leaderboard
        let entries = [];

        //Almacena si el orden se ha de invertir
        let invertedOrder = type === 'antiquity' ? true : false;

        //Pospone la respuesta del bot
        await interaction.deferReply();

        //Almacena la caché de los miembros de la guild
        const guildMembers = await client.homeGuild.members.fetch();

        //Por cada miembro en la base de datos de stats
        for (const memberId in client.db.stats) {

            //Almacena las stats del miembro iterado
            const memberStats = client.db.stats[memberId];

            //Busca el miembro en la guild, pasándole caché a la función
            const member = await client.functions.utilities.fetch.run(client, 'member', memberId, null, guildMembers);

            //Si el miembro no estaba en la guild y no se debe mostrar, lo omite
            if (commandConfig.hideNotPresent && !member) continue;

            //Omite si es clasificación de antigüedad y el miembro ya no está en el servidor
            if (type === 'antiquity' && !member) continue;
                
            //Sube una entrada al array de entradas
            entries.push({
                memberId: memberId,
                memberTag: member ? `**${member.user.tag}**` : locale.unknownMember,
                experience: memberStats.experience,
                aproxVoiceTime: memberStats.aproxVoiceTime,
                messagesCount: memberStats.messagesCount,
                antiquity: member.joinedTimestamp,
                lvl: memberStats.level
            });
        };

        //Ordena las entradas de mayor a menor
        function compare(a, b) {
            if (a[type] < b[type]) return invertedOrder ? -1 : 1;
            if (a[type] > b[type]) return invertedOrder ? 1 : -1;
            return 0;
        };

        //Compara y ordena el array de entradas
        entries.sort(compare);

        //Almacena las páginas totales
        const totalPages = Math.ceil(entries.length / 10);

        //Almacena el número de página a mostrar, si se proporciona
        const providedactualPageOption = interaction.options._hoistedOptions.find(prop => prop.name === locale.appData.options.page.name);
        const providedactualPage = providedactualPageOption ? providedactualPageOption.value : null;

        //Almacena la página actual (si se proporciona una, se elige esa)
        let actualPage = providedactualPage && providedactualPage <= totalPages ? providedactualPage : 1;

        //Almacena la última interacción del comando
        let latestInteraction;

        do {

            //Almacena el primer índice del rango de páginas
            const fromRange = 10 * actualPage - 9;

            //Almacena el último índice del rango de páginas
            const toRange = 10 * actualPage;

            //Almacena el string para la descripción
            let board = '';

            //Por cada indice del rango especificado
            for (let index = fromRange - 1; index < toRange; index++) {

                //Almacena la entrada iterada
                const entry = entries[index];

                //Si ya no quedan más entradas, aborta el bucle
                if (!entry) break;

                //En función del tipo proporcionado
                switch (type) {

                    //Si se desea mostrar la tabla de experiencia
                    case 'experience':

                        //Genera la tabla de experiencia
                        board += `\n**#${index + 1}** • \`${entry.experience} ${locale.embed.board.experience}\` • \`${locale.embed.board.level} ${entry.lvl}\` • ${entry.memberTag}`;
                        
                        //Para el switch
                        break;
                
                    //Si se desea mostrar la tabla de tiempo de voz
                    case 'aproxVoiceTime':

                        //Genera la tabla de tiempo de voz
                        board += `\n**#${index + 1}** • \`${await client.functions.utilities.msToTime.run(client, entry.aproxVoiceTime)}\` • ${entry.memberTag}`;
                        
                        //Para el switch
                        break;
                
                    //Si se desea mostrar la tabla de mensajes enviados
                    case 'messagesCount':

                        //Genera la tabla de mensajes enviados
                        board += `\n**#${index + 1}** • \`${entry.messagesCount} ${locale.embed.board.messagesCount}\` • ${entry.memberTag}`;
                        
                        //Para el switch
                        break;
                
                    //Si se desea mostrar la tabla de antigüedad
                    case 'antiquity':

                        //Genera la tabla de antigüedad
                        board += `\n**#${index + 1}** • \`${await client.functions.utilities.msToTime.run(client, Date.now() - entry.antiquity)}\` • ${entry.memberTag}`;
                        
                        //Para el switch
                        break;
                };
            };

            //Genera un embed a modo de página
            const newPageEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.primary)
                .setTitle(`:trophy: ${locale.embed.title[type]}`)
                .setDescription(board)
                .setFooter({ text: await client.functions.utilities.parseLocale.run(locale.embed.footer, { actualPage: actualPage, totalPages: totalPages }), iconURL: client.homeGuild.iconURL({dynamic: true}) });

            //Invoca el gestor de navegación mediante botones
            const buttonNavigationResult = await client.functions.managers.buttonNavigation.run(client, interaction, 'leaderboard', actualPage, totalPages, newPageEmbed, latestInteraction, null);

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
    type: 'global',
    defaultPermission: true,
    dmPermission: false,
    appData: {
        type: 'CHAT_INPUT',
        options: [
            {
                optionName: 'type',
                type: 'STRING',
                required: false,
                choices: [
                    {
                        choiceName: 'experience',
                        value: 'experience'
                    },
                    {
                        choiceName: 'aproxVoiceTime',
                        value: 'aproxVoiceTime'
                    },
                    {
                        choiceName: 'messagesCount',
                        value: 'messagesCount'
                    },
                    {
                        choiceName: 'antiquity',
                        value: 'antiquity'
                    }
                ]
            },
            {
                optionName: 'page',
                type: 'INTEGER',
                minValue: 1,
                required: false
            }
        ]
    }
};
