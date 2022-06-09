exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Comprueba los requisitos previos para el comando
        if (!await require('../../../utils/voice/preChecks.js').run(client, interaction, ['has-queue'])) return;

        //Almacena la cola
        const reproductionQueue = client.reproductionQueues[interaction.guild.id];

        //Almacena la página actual y las totales
        let position = 1;
        let pages = Math.ceil((reproductionQueue.tracks.length) / 5);
        if (pages == 0) pages = 1;

        //Almacena el argumento proporcionado por el usuario (si lo hay)
        const argument = interaction.options._hoistedOptions[0] ? interaction.options._hoistedOptions[0].value : null;

        //Almacena la página que introduce el miembro (si lo hace)
        if (argument && argument > 0 && argument <= pages) position = argument;

        //Función para generar el mensaje de cola
        async function generateEmbed(fromRange, toRange, embed) {

            //Herramienta para generar colores aleatorios
            const randomColor = require('randomcolor');
            
            //Carga el embed de la cola
            let queueEmbed = new client.MessageEmbed()
                .setColor(randomColor())
                .setAuthor({ name: locale.queueEmbed.author, iconURL: 'attachment://dj.png' })
                .setDescription(`[${reproductionQueue.tracks[0].meta.title}](${reproductionQueue.tracks[0].meta.location})\n● ${locale.queueEmbed.duration}: \`${reproductionQueue.tracks[0].meta.length !== 0 ? client.functions.msToDHHMMSS(reproductionQueue.tracks[0].meta.length) : locale.queueEmbed.isLive}\`\n ● ${locale.queueEmbed.requestedBy}: <@${reproductionQueue.tracks[0].requesterId}>`)
                .setFooter({ text: await client.functions.getMusicFooter(reproductionQueue.boundedTextChannel.guild) });
            
            //Si hay cola, carga la cola en el embed
            if (reproductionQueue.tracks[1]) {
                let queueList = '';
                
                //Genera la página de la cola
                for (let id = fromRange; id < toRange; id++) {
                    if (!reproductionQueue.tracks[id]) break; //Si no hay resultado, para la ejecución
                    const trackMeta = reproductionQueue.tracks[id].meta; //Almacena los metadatos de la pista
                    let title = trackMeta.title; //Almacena el título
                    title = title.replace('[', '').replace('[', '').replace(']', '').replace('|', '').replace('(', '').replace(')', '').replace('_', '').replace('*', ''); //Elimina signos que alteren la forma en la que se muestra la entrada
                    if (title.length > 40) title = `${title.slice(0, 40)} ...`; //Acorta el título si es demasiado largo
                    queueList = `${queueList}\`${id}.\` [${title}](${trackMeta.location}) | \`${trackMeta.length !== 0 ? client.functions.msToDHHMMSS(trackMeta.length) : locale.queueEmbed.isLive}\` | <@${reproductionQueue.tracks[id].requesterId}>\n`;
                };
                
                //Añade el campo al embed
                queueEmbed.addField(locale.queueEmbed.upNext, queueList, true);
            };

            //Elige si se ha de enviar el embed o editarlo
            if (embed) {
                await embed.edit({ embeds: [queueEmbed], files: ['./resources/images/dj.png'] }).then(async embed => {
                    if ((Math.ceil(reproductionQueue.tracks.length / 5)) > 1) awaitReactions(embed);
                });
            } else {
                const sentEmbed = await interaction.reply({ embeds: [queueEmbed], files: ['./resources/images/dj.png'], fetchReply: true });
                if ((Math.ceil(reproductionQueue.tracks.length / 5)) > 1) awaitReactions(sentEmbed);
            };
        };

        //Función para manejar el menú de reacciones
        async function awaitReactions(embed) {

            //Borra todas las reacciones previas (si tiene)
            if (embed.reactions) await embed.reactions.removeAll();

            //Reacciona con el menú correspondiente según la página
            if (position > 1) await embed.react('⏮');
            if (position > 1) await embed.react('◀');
            if (position < pages) await embed.react('▶');
            if (position < pages) await embed.react('⏭');

            //Crea el filtro de reacciones según la página
            const filter = (reaction, user) => {
                let validReactions = [];
                if (position > 1) validReactions.push('⏮', '◀');
                if (position < pages) validReactions.push('▶', '⏭');
                return validReactions.includes(reaction.emoji.name) && user.id === interaction.member.id;
            };

            //Inicializa un listener de reacciones en función del filtro
            embed.awaitReactions({ filter, max: 1, time: 60000, errors: ['time'] }).then(async collected => {

                //Almacena la primera reacción
                const reaction = collected.first();

                //Según el emoji reaccionado, actualiza el contador consecutivamente
                if (reaction.emoji.name === '⏮' && position > 1) position = 1;
                if (reaction.emoji.name === '◀' && position > 1) position = position - 1;
                if (reaction.emoji.name === '▶' && position < pages) position = position + 1;
                if (reaction.emoji.name === '⏭' && position < pages) position = pages;

                //Carga la nueva página
                generateEmbed(5 * position - (position == 1 ? 4 : 5), 5 * position, embed);

            }).catch(() => embed.reactions.removeAll());
        };

        //Llama a la primera página (o a la especificada)
        generateEmbed(5 * position - (position == 1 ? 4 : 5), 5 * position);
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.interactionErrorHandler(error, interaction);
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
