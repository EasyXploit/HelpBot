exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await client.functions.reproduction.preChecks.run(client, interaction, ['has-queue'])) return;

        //Almacena la cola
        const reproductionQueue = client.reproductionQueues[interaction.guild.id];

        //Almacena las páginas totales
        let totalPages = Math.ceil(reproductionQueue.tracks.length / 5);

        //Si el total se calculó a 0, lo cambia a 1
        if (totalPages === 0) totalPages = 1;

        //Almacena la posición provista, si se proporcionó
        const providedActualPage = interaction.options._hoistedOptions[0] ? interaction.options._hoistedOptions[0].value : null

        //Almacena la página actual (si se proporciona una, se elige esa)
        let actualPage = providedActualPage && providedActualPage > 0 && providedActualPage <= totalPages ? providedActualPage : 1;

        //Herramienta para generar colores aleatorios
        const randomColor = require('randomcolor');

        //Almacena la última interacción del comando
        let latestInteraction;
        
        do {

            //Almacena el primer índice del rango de páginas
            const fromRange = 5 * actualPage - (actualPage == 1 ? 4 : 5);

            //Almacena el último índice del rango de páginas
            const toRange = 5 * actualPage;

            //Carga el embed de la cola
            let newPageEmbed = new client.MessageEmbed()
                .setColor(randomColor())
                .setAuthor({ name: locale.queueEmbed.author, iconURL: 'attachment://dj.png' })
                .setDescription(`[${reproductionQueue.tracks[0].meta.title}](${reproductionQueue.tracks[0].meta.location})\n\n● ${locale.queueEmbed.duration}: \`${reproductionQueue.tracks[0].meta.length !== 0 ? await client.functions.utilities.msToTime.run(client, reproductionQueue.tracks[0].meta.length) : locale.queueEmbed.isLive}\`\n ● ${locale.queueEmbed.requestedBy}: <@${reproductionQueue.tracks[0].requesterId}>`)
                .setFooter({ text: await client.functions.reproduction.getFooter.run(client, reproductionQueue.boundedTextChannel.guild) });
            
            //Si hay cola, carga la cola en el embed
            if (reproductionQueue.tracks[1]) {

                //Almacena el string de la cola
                let queueList = '';
                
                //Genera la página de la cola
                for (let id = fromRange; id < toRange; id++) {

                    //Si no hay resultado, para la ejecución
                    if (!reproductionQueue.tracks[id]) break;

                    //Almacena los metadatos de la pista
                    const trackMeta = reproductionQueue.tracks[id].meta;

                    //Elimina signos que alteren la forma en la que se muestra la entrada
                    trackMeta.title = trackMeta.title.replace('[', '').replace('[', '').replace(']', '').replace('|', '').replace('(', '').replace(')', '').replace('_', '').replace('*', '');

                    //Acorta el título si es demasiado largo
                    if (trackMeta.title.length > 40) title = `${trackMeta.title.slice(0, 40)} ...`;

                    //Genera el string del item de la cola
                    queueList = `${queueList}\`${id}.\` [${trackMeta.title}](${trackMeta.location}) | \`${trackMeta.length !== 0 ? await client.functions.utilities.msToTime.run(client, trackMeta.length) : locale.queueEmbed.isLive}\` | <@${reproductionQueue.tracks[id].requesterId}>\n`;
                };
                
                //Añade el campo al embed
                newPageEmbed.addField(locale.queueEmbed.upNext, queueList, true);
            };

            //Invoca el gestor de navegación mediante botones
            const buttonNavigationResult = await client.functions.managers.buttonNavigation.run(client, interaction, 'queue', actualPage, totalPages, newPageEmbed, latestInteraction, ['./resources/images/dj.png']);

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
