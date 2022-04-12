exports.run = async (client, message, args, command, commandConfig) => {

    try {

        //Almacena las entradas de la leaderboard
        let entries = [];

        //Por cada miembro en la base de datos de stats
        for (const memberId in client.db.stats) {

            //Almacena las stats del miembro iterado
            const memberStats = client.db.stats[memberId];
                
            //Sube una entrada al array de entradas
            entries.push({
                memberId: memberId,
                totalXP: memberStats.totalXP,
                lvl: memberStats.level
            });
        };

        //Ordena las entradas en función de su cantidad de XP
        function compare(a, b) {
            if (a.totalXP < b.totalXP) return 1;
            if (a.totalXP > b.totalXP) return -1;
            return 0;
        };

        //Compara y ordena el array de entradas
        entries.sort(compare);

        //Almacena las páginas totales
        const pages = Math.ceil(entries.length / 10);

        //Almacena la página actual (si se proporciona una, se elige esa)
        let position = args[0] && !isNaN(args[0]) && args[0] > 0 && args[0] <= pages ? args[0] : 1;

        //Función para cargar un rango de entradas de la tabla
        async function loadBoard(fromRange, toRange) {

            //Almacena el string de la tabla
            let board = '';

            //Por cada indice del rango especificado
            for (let index = fromRange - 1; index < toRange; index++) {

                //Almacena la entrada iterada
                const entry = entries[index];

                //Si ya no quedan más entradas, aborta el bucle
                if (!entry) break;

                //Busca el miembro en la guild
                const member = await client.functions.fetchMember(message.guild, entry.memberId) || 'Desconocido';

                //Actualiza la tabla con una entrada formateada
                board += `\n**#${index + 1}** • \`${entry.totalXP} xp\` • \`lvl ${entry.lvl}\` • ${member}`;

            };

            //Devuelve la tabla actual
            return board;
        };

        //Función para mostrar la primera tabla de clasififcación o actualizarla
        async function showLeaderboard(embed) {

            //Genera una tabla de clasificación (cómo embed)
            const leaderboard = new client.MessageEmbed()
                .setColor(client.config.colors.primary)
                .setTitle(':trophy: Tabla de clasificación')
                .setDescription(await loadBoard(10 * position - 9, 10 * position))
                .setFooter({ text: `Página ${position} de ${pages}`, iconURL: client.homeGuild.iconURL({dynamic: true}) });

            //Envía o actualiza la tabla de clasificación
            if (embed) await embed.edit({ embeds: [leaderboard] }).then(async embed => {awaitReactions(embed)});
            else await message.channel.send({ embeds: [leaderboard] }).then(async embed => {awaitReactions(embed)});
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

                //Crea un array de reacciones válidas
                let validReactions = [];

                //Si no es la primera página
                if (position > 1) validReactions.push('⏮', '◀');

                //Si no es la última página
                if (position < pages) validReactions.push('▶', '⏭');

                //Devuelve si el filtro encajó con la reacción
                return validReactions.includes(reaction.emoji.name) && user.id === message.author.id;
            };

            //Inicializa un listener de reaccciones en función del filtro
            embed.awaitReactions({ filter, max: 1, time: 60000, errors: ['time'] }).then(async collected => {

                //Almacena la primera reacción
                const reaction = collected.first();

                //Según el emoji reaccionado, actualiza el contador consecutivamente
                if (reaction.emoji.name === '⏮' && position > 1) position = 1;
                if (reaction.emoji.name === '◀' && position > 1) position = position - 1;
                if (reaction.emoji.name === '▶' && position < pages) position = position + 1;
                if (reaction.emoji.name === '⏭' && position < pages) position = pages;

                //Carga la nueva tabla de clasififcación
                showLeaderboard(embed);

            }).catch(() => embed.reactions.removeAll());
        };

        //Genera la primera tabla de clasififcación
        showLeaderboard();

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'leaderboard',
    description: 'Muestra la tabla de clasificación de XP de la comunidad.',
    aliases: ['levels'],
    parameters: '[número de página]'
};
