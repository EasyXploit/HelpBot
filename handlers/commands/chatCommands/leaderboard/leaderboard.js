exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Devuelve un error si no hay tabla de clasificación
        if (!client.db.stats || !Object.keys(client.db.stats).length) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} ${locale.noLeaderboard}.`)
        ], ephemeral: true});








        

        //Almacena las entradas de la leaderboard
        let entries = [];

        //Por cada miembro en la base de datos de stats
        for (const memberId in client.db.stats) {

            //Almacena las stats del miembro iterado
            const memberStats = client.db.stats[memberId];
                
            //Sube una entrada al array de entradas
            entries.push({
                memberId: memberId,
                experience: memberStats.experience,
                lvl: memberStats.level
            });
        };

        //Ordena las entradas en función de su cantidad de XP
        function compare(a, b) {
            if (a.experience < b.experience) return 1;
            if (a.experience > b.experience) return -1;
            return 0;
        };

        //Compara y ordena el array de entradas
        entries.sort(compare);












        //Almacena las páginas totales
        const totalPages = Math.ceil(entries.length / 10);

        //Almacena la posición provista, si se proporcionó
        const providedactualPage = interaction.options._hoistedOptions[0] ? interaction.options._hoistedOptions[0].value : null

        //Almacena la página actual (si se proporciona una, se elige esa)
        let actualPage = providedactualPage && providedactualPage > 0 && providedactualPage <= totalPages ? providedactualPage : 1;

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

                //Busca el miembro en la guild
                const member = await client.functions.utilities.fetch.run(client, 'member', entry.memberId) || locale.unknownMember;

                //Actualiza la tabla con una entrada formateada
                board += `\n**#${index + 1}** • \`${entry.experience} ${locale.embed.xp}\` • \`${locale.embed.lvl} ${entry.lvl}\` • ${member}`;

            };

            //Genera un embed a modo de página
            const newPageEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.primary)
                .setTitle(`:trophy: ${locale.embed.title}`)
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
    type: 'guild',
    defaultPermission: true,
    appData: {
        type: 'CHAT_INPUT',
        options: [
            {
                optionName: 'page',
                type: 'INTEGER',
                required: false
            }
        ]
    }
};
