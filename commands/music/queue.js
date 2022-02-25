exports.run = async (client, message, args, command, commandConfig) => {
    
    //!queue (página | nada)

    try {

        //Devuelve si no hay cola
        if (!client.reproductionQueues[message.guild.id] || !client.reproductionQueues[message.guild.id].tracks || Object.entries(client.reproductionQueues[message.guild.id].tracks).length === 0) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.error)
            .setDescription(`${client.customEmojis.redTick} El bot no tiene ninguna pista en la cola.`)]
        });

        //Almacena la cola
        let reproductionQueue = client.reproductionQueues[message.guild.id];

        //Almacena la página actual y las totales
        let position = 1;
        let pages = Math.ceil((reproductionQueue.tracks.length - 1) / 5);
        if (pages == 0) pages = 1;

        //Almacena la página que introduce el miembro (si lo hace)
        if (args[0] && !isNaN(args[0]) && args[0] > 0 && args[0] <= pages) position = args[0];

        //Función para generar el mensaje de cola
        async function generateEmbed(fromRange, toRange, embed) {

             //Carga el footer
            let footer = `Página ${position} de ${pages}`;
            if (reproductionQueue.mode) {
                switch (reproductionQueue.mode) {
                    case 'shuffle': footer = footer + ` | 🔀`; break;
                    case 'loop': footer = footer + ` | 🔂`; break;
                    case 'loopqueue': footer = footer + ` | 🔁`; break;
                };
            };

            //Herramienta para generar colores aleatorios
            const randomColor = require('randomcolor');
            
            //Carga el embed de la cola
            let queueEmbed = new client.MessageEmbed()
                    .setColor(randomColor())
                    .setAuthor({ name: 'Cola de reproducción - Ahora mismo:', iconURL: 'attachment://dj.png' })
                    .setDescription(`[${reproductionQueue.tracks[0].meta.title}](${reproductionQueue.tracks[0].meta.location})\n● Duración: \`${client.functions.msToHHMMSS(reproductionQueue.tracks[0].meta.length)}\`.\n ● Requerida por: <@${reproductionQueue.tracks[0].requesterId}>`)
                    .setFooter({ text: footer, iconURL: client.homeGuild.iconURL({dynamic: true}) });
            
            //Si hay cola, carga la cola en el embed
            if (reproductionQueue.tracks[1]) {
                let queueList = '';
                
                //Genera la página de la cola
                for (let id = fromRange; id < toRange; id++) {
                    if (!reproductionQueue.tracks[id]) break; //Si no hay resultado, para la ejecución
                    let title = reproductionQueue.tracks[id].meta.title; //Almacena el título
                    title = title.replace('[', '').replace('[', '').replace(']', '').replace('|', '').replace('(', '').replace(')', '').replace('_', '').replace('*', ''); //Elimina signos que alteren la forma en la que se muestra la entrada
                    if (title.length > 40) title = `${title.slice(0, 40)} ...`; //Acorta el título si es demasiado largo
                    queueList = `${queueList}\`${id}.\` [${title}](${reproductionQueue.tracks[id].meta.location}) | \`${client.functions.msToHHMMSS(reproductionQueue.tracks[id].meta.length / 1000)}\` | <@${reproductionQueue.tracks[id].requesterId}>\n`;
                };
                
                //Añade el campo al embed
                queueEmbed.addField('A continuación', queueList, true);
            };

            //Elige si se ha de enviar el embed o editarlo
            if (embed) {
                await embed.edit({ embeds: [queueEmbed], files: ['./resources/images/dj.png'] }).then(async embed => {
                    if ((Math.ceil(reproductionQueue.tracks.length / 5)) != 0) awaitReactions(embed);
                });
            } else {
                await message.channel.send({ embeds: [queueEmbed], files: ['./resources/images/dj.png'] }).then(async embed => {
                    if ((Math.ceil(reproductionQueue.tracks.length / 5)) != 0) awaitReactions(embed);
                });
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

            //Inicializa un listener de reacciones en función del filtro
            embed.awaitReactions({ filter, max: 1, time: 60000, errors: ['time'] }).then(async collected => {
                const reaction = collected.first();

                //Según el emoji reaccionado, actualiza el contador consecutivamente
                if (reaction.emoji.name === '⏮' && position > 1) position = 1;
                if (reaction.emoji.name === '◀' && position > 1) position = position - 1;
                if (reaction.emoji.name === '▶' && position < pages) position = position + 1;
                if (reaction.emoji.name === '⏭' && position < pages) position = pages;

                //Carga la nueva página
                generateEmbed(5 * position - 4, 5 * position, embed);
            }).catch(() => embed.reactions.removeAll());
        };

        //Llama a la primera página
        generateEmbed(5 * position - 4, 5 * position);
        
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'queue',
    aliases: ['q']
};
