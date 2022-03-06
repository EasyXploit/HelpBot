exports.run = async (client, message, args, command, commandConfig) => {

    //!leaderboard [pág.]

    try {
        //Almacena las entradas de la leaderboard
        let entries = [];
        for (var key in client.stats[message.guild.id]) {
            if (client.stats[message.guild.id].hasOwnProperty(key)) {           
                entries.push({
                    userID: key,
                    totalXP: client.stats[message.guild.id][key].totalXP,
                    lvl: client.stats[message.guild.id][key].level
                });
            };
        };

        //Ordena las entradas en función de su cantidad de XP
        function compare(a, b) {
            if (a.totalXP < b.totalXP) return 1;
            if (a.totalXP > b.totalXP) return -1;
            return 0;
        };
        entries.sort(compare);

        //Almacena la página actual y las totales
        let position = 1;
        const pages = Math.ceil(entries.length / 10);

        if (args[0] && !isNaN(args[0]) && args[0] > 0 && args[0] <= pages) position = args[0];

        //Función para cargar un rango de entradas
        async function loadBoard(fromRange, toRange) {
            let board = '';
            for (let i = fromRange - 1; i < toRange; i++) {
                let entry = entries[i];
                if (!entry) break;

                let member = await client.functions.fetchMember(message.guild, entry.userID);
                if (!member) member = `<@${entry.userID}>`
                board = `${board}\n**#${i + 1}** • \`${entry.totalXP} xp\` • \`lvl ${entry.lvl}\` • ${member}`;

            };
            return board;
        };

        //Función para mostrar la primera leaderboard o actualizarla
        async function showLeaderboard(embed) {
            let leaderboard = new client.MessageEmbed()
                .setColor(client.config.colors.primary)
                .setTitle(`:trophy: Tabla de clasificación`)
                .setDescription(await loadBoard(10 * position - 9, 10 * position))
                .setFooter({ text: `Página ${position} de ${pages}`, iconURL: client.homeGuild.iconURL({dynamic: true}) });

            if (embed) {
                await embed.edit({ embeds: [leaderboard] }).then(async embed => {awaitReactions(embed)});
            } else {
                await message.channel.send({ embeds: [leaderboard] }).then(async embed => {awaitReactions(embed)});
            };
        };

        //Función para manejar el menú de reacciones
        async function awaitReactions(embed) {
            if (embed.reactions) await embed.reactions.removeAll(); //Borra todas las reacciones previas (si tiene)

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
                return validReactions.includes(reaction.emoji.name) && user.id === message.author.id;
            };

            //Inicializa un listener de reaccciones en función del filtro
            embed.awaitReactions({ filter, max: 1, time: 60000, errors: ['time'] }).then(async collected => {
                const reaction = collected.first();

                //Según el emoji reaccionado, actualiza el contador consecutivamente
                if (reaction.emoji.name === '⏮' && position > 1) position = 1;
                if (reaction.emoji.name === '◀' && position > 1) position = position - 1;
                if (reaction.emoji.name === '▶' && position < pages) position = position + 1;
                if (reaction.emoji.name === '⏭' && position < pages) position = pages;

                //Carga la nueva leaderboard
                showLeaderboard(embed);
            }).catch(() => embed.reactions.removeAll());
        };

        //Llama la primera leaderboard
        showLeaderboard();

    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'leaderboard',
    aliases: ['levels']
};
