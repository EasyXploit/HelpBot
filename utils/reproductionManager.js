exports.run = async (discord, client, resources, message, ytdl, moment, randomColor) => {

    try {
        //Función para reproducir
        async function play(connection, message) {
            
            //Almacena la información de reproducción del servidor
            let server = client.servers[message.guild.id];

            //Almacena la posición a roproducir de la cola
            let toPlay = 0;

            //Aleatoriza la canción elegida de la cola
            if (server.mode === 'shuffle') toPlay = Math.floor(Math.random() * (server.queue.length - 1));

            //Reproduce la canción
            client.voiceDispatcher = connection.play(await ytdl(server.queue[toPlay].link), {type: 'opus'});
            
            //Almacena la información de la entrada de la cola
            let info = server.queue[toPlay];

            //Almacena una variable para guardar el título la siguiente canción
            let upNext = `Nada`;

            //Calcula cual es el título de la siguiente canción, si es que hay
            if (server.queue[1]) {
                if (client.servers[message.guild.id].mode === 'shuffle') { //Caso aleatorio
                    upNext = `Aleatorio`;
                } else if (client.servers[message.guild.id].mode === 'loop') { //Caso loop
                    upNext = `[${server.queue[0].title}](${server.queue[0].link})`;
                } else { //Caso normal / loopqueue
                    upNext = `[${server.queue[1].title}](${server.queue[1].link})`;
                };
            };

            //Genera el footer
            let footer = `© ${new Date().getFullYear()} República Gamer S.L.`;
            if (server.mode) {
                switch (server.mode) {
                    case 'shuffle':
                        footer = footer + ` | 🔀`;
                        break;
                
                    case 'loop':
                        footer = footer + ` | 🔂`;
                        break;

                    case 'loopqueue':
                        footer = footer + ` | 🔁`;
                        break;
                };
            };

            //Embed con la información de la canción en reproducción
            let playingEmbed = new discord.MessageEmbed()
                .setColor(randomColor())
                .setThumbnail(info.thumbnail)
                .setAuthor(`Reproduciendo 🎶`, `https://i.imgur.com/lvShSwa.png`)
                .setDescription(`[${info.title}](${info.link})\n\n● **Autor:** \`${info.author}\`\n● **Duración:** \`${moment().startOf('day').seconds(info.lengthSeconds).format('H:mm:ss')}\``)
                .addField(`Solicitado por:`, server.queue[toPlay].requestedBy, true)
                .addField(`Siguiente:`, upNext, true)
                .setFooter(footer, resources.server.iconURL());

            //Envía un mensaje de confirmación
            message.channel.send(playingEmbed);
            
            //Elimina de la cola la canción actual
            if (client.servers[message.guild.id].mode === 'shuffle') { //Si el modo aleatorio está activado
                client.servers[message.guild.id].queue.splice(toPlay, 1);
            } else if (client.servers[message.guild.id].mode === 'loopqueue') { //Si el modo de cola en bucle está activado
                //Regenera la información de la cola
                let newQueueItem = {
                    link: server.nowplaying.link,
                    title: server.nowplaying.title,
                    duration: server.nowplaying.duration,
                    requestedBy: server.nowplaying.requestedBy,
                    requestedById: nowplaying.requestedById
                };

                //Vuelve a subir la canción al final de la cola
                client.servers[message.guild.id].queue.push(newQueueItem);

                //Quita el primer elemento de la cola
                server.queue.shift();
            } else if (!client.servers[message.guild.id].mode) {
                //Quita el primer elemento de la cola
                server.queue.shift();
            };

            //Actualiza nowplaying
            server.nowplaying = {
                title: info.title,
                link: info.link,
                duration: moment().startOf('day').seconds(info.lengthSeconds).format('H:mm:ss'),
                requestedBy: message.member.displayName,
                requestedById: message.member.id
            };

            //Cuando la reproducción ha finalizado
            client.voiceDispatcher.on(`finish`, reason => {

                //Si queda algo en la cola
                if (server.queue[0]) {

                    //Vuelve a cargar la función de reproducción
                    play(client.voiceConnection, message);

                } else {

                    //Vacia nowplaying
                    server.nowplaying = null;

                    //Manda un mensaje de abandono
                    message.channel.send(`⏹ | Reproducción finalizada`);

                    //Vacia nowplaying
                    server.nowplaying = null;

                    //Cambia el estatus a "DISPONIBLE"
                    client.voiceStatus = true;

                    //Crea un contador que para demorar un minuto la salida del canal y la destrucción del dispatcher
                    client.voiceTimeout = setTimeout(() => {

                        const fs = require('fs');
                        const fileNames = fs.readdirSync(`./resources/audios/`);

                        //Reproduce el efecto de despedida
                        client.voiceDispatcher = client.voiceConnection.play(`./resources/audios/${fileNames[Math.floor(Math.random() * fileNames.length)]}`);

                        //Aborta la conexión después de despedirse
                        setTimeout(() => {
                            //Aborta la conexión
                            connection.disconnect();

                            //Confirma la acción
                            message.channel.send(`⏏ | He abandonado el canal`);

                            //Bora la información de reproducción del server
                            delete client.servers[message.guild.id];

                            //Vacía la variable del timeout
                            client.voiceTimeout = null;
                        }, 3000);
                    }, 60000);

                };
            });

            //Se dispara si el dispatcher tiene información de depuración a mostrar
            client.voiceDispatcher.on(`debug`, debug => {
                console.log(`${new Date().toLocaleString()} 》Dispatcher (debug): ${debug}`);
            });

            //Se dispara si ocurre un error durante el streaming
            client.voiceDispatcher.on(`error`, error => {
                console.log(`${new Date().toLocaleString()} 》Dispatcher error: ${error}`);
            });
        };

        //Reproduce la canción
        play(client.voiceConnection, message);
    } catch (e) {
        console.log(`${new Date().toLocaleString()} 》Error: ${e}`);
    };
};
