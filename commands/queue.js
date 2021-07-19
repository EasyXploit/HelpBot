exports.run = async (discord, client, message, args, command) => {
    
    //!queue (página | nada)

    try {
        const randomColor = require('randomcolor');
        const moment = require(`moment`);
        
        //Devuelve si no hay cola
        let noQueueEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red)
            .setDescription(`${client.customEmojis.redTick} El bot no tiene ninguna canción en la cola.`);
        
        if (!client.queues[message.guild.id] || !client.queues[message.guild.id].nowplaying || Object.entries(client.queues[message.guild.id].nowplaying).length === 0) return message.channel.send(noQueueEmbed);
        
        //Almacena el servidor
        let server = client.queues[message.guild.id];

        //Almacena la cola
        let serverQueue = client.queues[message.guild.id].queue;

        //Almacena la página actual y las totales
        let position = 1;
        let pages = Math.ceil(serverQueue.length / 5);
        if (pages == 0) pages = 1;

        //Almacena la página que introduce el miembro (si lo hace)
        if (args[0] && !isNaN(args[0]) && args[0] > 0 && args[0] <= pages) position = args[0];

        //Función para generar el mensaje de cola
        async function generateEmbed(fromRange, toRange, embed) {

             //Carga el footer
            let footer = `Página ${position} de ${pages}`;
            if (server.mode) {
                switch (server.mode) {
                    case 'shuffle': footer = footer + ` | 🔀`; break;
                    case 'loop': footer = footer + ` | 🔂`; break;
                    case 'loopqueue': footer = footer + ` | 🔁`; break;
                };
            };
            
            //Carga el embed de la cola
            let queueEmbed = new discord.MessageEmbed()
                    .setColor(randomColor())
                    .setAuthor(`Cola de reproducción - Ahora mismo:`, `https://i.imgur.com/lvShSwa.png`)
                    .setDescription(`[${server.nowplaying.title}](${server.nowplaying.link})\n● Duración: \`${server.nowplaying.duration}\`.\n ● Requerida por: \`${server.nowplaying.requestedBy}\``)
                    .setFooter(footer, client.homeGuild.iconURL());
            
            //Si hay cola, carga la cola en el embed
            if (serverQueue[0]) {
                serverQueue = client.queues[message.guild.id].queue; //Por si acaso, recarga la cola
                let queueList = '';
                
                //Genera la página de la cola
                for (let id = fromRange - 1; id < toRange; id++) {
                    if (!serverQueue[id]) break; //Si no hay resultado, para la ejecución
                    let title = serverQueue[id].title; //Almacena el título
                    if (title.length > 40) title = `${title.slice(0, 40)} ...`; //Acorta el título si es demasiado largo
                    queueList = `${queueList}\`${id + 1}.\` [${title}](${serverQueue[id].link}) | \`${moment().startOf('day').seconds(serverQueue[id].lengthSeconds).format('H:mm:ss')}\` | ${serverQueue[id].requestedBy}\n`;
                };
                
                //Añade el campo al embed
                queueEmbed.addField(`A continuación`, queueList, true);
            };

            //Elige si se ha de enviar el embed o editarlo
            if (embed) {
                await embed.edit(queueEmbed).then(async embed => {
                    if ((Math.ceil(serverQueue.length / 5)) != 0) awaitReactions(embed);
                });
            } else {
                await message.channel.send(queueEmbed).then(async embed => {
                    if ((Math.ceil(serverQueue.length / 5)) != 0) awaitReactions(embed);
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

            //Inicializa un listener de reaccciones en función del filtro
            embed.awaitReactions(filter, { max: 1, time: 60000, errors: [`time`] }).then(async collected => {
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
        
        require('../utils/errorHandler.js').run(discord, client, message, args, command, e);
    } catch (error) {
    };
};
