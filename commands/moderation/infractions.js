exports.run = async (client, message, args, command, commandConfig) => {

    try {

        //Busca el miembro en cuestión
        const member = await client.functions.fetchMember(message.guild, args[0] || message.author.id);

        //Si no se encuentra, devuelve un error
        if (!member) return await client.functions.syntaxHandler(message.channel, commandConfig);

        //Comprueba, si corresponde, que el miembro tenga permiso para ver el historial de otros
        if (message.member.id !== member.id) {

            //Variable para saber si está autorizado
            let authorized;

            //Para cada ID de rol de la lista blanca
            for (let i = 0; i < commandConfig.canSeeAny.length; i++) {

                //Si se permite si el que invocó el comando es el dueño, o uno de los roles del miembro coincide con la lista blanca, entonces permite la ejecución
                if (message.author.id === message.guild.ownerId || message.author.id === client.config.main.botManagerRole || message.member.roles.cache.find(r => r.id === commandConfig.canSeeAny[i])) {
                    authorized = true;
                    break;
                };
            };

            //Si no se permitió la ejecución, manda un mensaje de error
            if (!authorized) return message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${message.author}, no dispones de privilegios para realizar esta operación`)]
            }).then(msg => {setTimeout(() => msg.delete(), 5000)});
        };

        //Comprueba si se trata de un bot
        if (member.user.bot) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} No puedes obtener información de un bot`)
        ]});

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
                const moderator = await client.functions.fetchMember(client.homeGuild, warn.moderator) || 'Moderador desconocido';

                //Añade una nueva fila con los detalles de la advertencia
                board += `\`${Object.keys(memberWarns[index])[0]}\` • ${moderator} • <t:${Math.round(new Date(parseInt(warn.timestamp)) / 1000)}>\n${warn.reason}\n\n`;
            };

            //Cuando acaba, devuelve la tabla
            return board;
        };

        //Función para cargar una página determinada
        async function loadEmbed(embed) {

            //Almacena la sanción actyal, si aplica
            let sanction;

            //Comprueba qué tipo de sanción tiene el miembro (si la tiene)
            if (client.db.mutes[member.id]) sanction = `Silenciado hasta <t:${Math.round(new Date(client.db.mutes[member.id].time) / 1000)}>`;
            else if (member.roles.cache.has(client.config.dynamic.mutedRoleId)) sanction = 'Silenciado indefinidamente';

            //Genera el embed de las infracciones
            let infractionsEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.primary)
                .setTitle('⚠ Advertencias')
                .setDescription(`Mostrando las advertencias del miembro **${member.user.tag}**\nSanción actual: \`${sanction || 'Ninguna'}\`.`)
                .setThumbnail(member.user.displayAvatarURL({dynamic: true}))
                .addField('Últimas 24h', onDay.toString(), true)
                .addField('Últimos 7 días', onWeek.toString(), true)
                .addField('Total', total.toString(), true)
                .addField('Listado de advertencias', total > 0 ? await loadWarns(10 * actualPage - 9, 10 * actualPage) : 'Ninguna')
                .setFooter({ text: `Página ${actualPage} de ${totalPages}`, iconURL: client.homeGuild.iconURL({dynamic: true}) });

            //Comprueba si ha de editar o enviar el embed
            if (embed) await embed.edit({ embeds: [infractionsEmbed] }).then(async embed => { awaitReactions(embed) });
            else await message.channel.send({ embeds: [infractionsEmbed] }).then(async embed => { awaitReactions(embed) });
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
            const filter = (reaction, user) => {

                //Crea un array de reacciones válidas
                let validReactions = [];

                //Si no es la primera página
                if (actualPage > 1) validReactions.push('⏮', '◀');

                //Si no es la última página
                if (actualPage < totalPages) validReactions.push('▶', '⏭');

                //Devuelve si el filtro encajó con la reacción
                return validReactions.includes(reaction.emoji.name) && user.id === message.author.id;
            };

            //Inicializa un listener de reaccciones en función del filtro
            embed.awaitReactions({ filter, max: 1, time: 60000, errors: ['time'] }).then(async collected => {

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
        let actualPage = 1;

        //Almacena el total de sanciones, en 1 día y 1 semana, y las páginas totales
        let onDay = onWeek = total = totalPages = 0;

        //Almacena las advertencias del miembro
        let memberWarns = client.db.warns[member.id];

        //Si el miembro tenía advertencias
        if (client.db.warns[member.id]) {

            //Mapea las advertencias del miembro
            memberWarns = Object.entries(client.db.warns[member.id]).reverse().map((warn) => ({ [warn[0]]: warn[1] }));

            //Almacena el total de ellas
            total = memberWarns.length

            //Almacena el total de páginas
            totalPages = memberWarns ? Math.ceil(memberWarns.length / 10) : 0;

            //Comprueba si se ha proporcionado una página inicial
            if (args[1] && !isNaN(args[1]) && args[1] > 0 && args[1] <= totalPages) actualPage = args[1];

            //Por cada advertencia del miembro
            Object.values(memberWarns).forEach(warn => {

                //Si ocurrió en un día o menos, lo contabiliza
                if (Date.now() - warn.timestamp <= '86400000') onDay++;

                //Si ocurrió en una semana o menos, lo contabiliza
                if (Date.now() - warn.timestamp <= '604800000') onWeek++;
            });
        };

        //Genera el primer embed
        loadEmbed();
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'infractions',
    description: 'Muestra una lista con las infracciones de un miembro y sus respectivos ID.',
    aliases: ['warns'],
    parameters: '[@miembro | id]'
};
