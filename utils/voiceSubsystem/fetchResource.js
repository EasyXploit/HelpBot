exports.run = async (client, args, message, streamType, toStream) => {

	try {

		//Herramienta para generar colores aleatorios
		const randomColor = require('randomcolor');
		
		//Comprueba si debe crear el objeto global de colas
		if (!client.reproductionQueues[message.guild.id]) client.reproductionQueues[message.guild.id] = { boundedTextChannel: null, timeout: null, votes: {}, mode: false, tracks: [] };
	
		//Almacena el objeto de colas de la guild
		const reproductionQueue = client.reproductionQueues[message.guild.id];
	
		//Almacena el canal del mensaje para vincular los mensajes de reproducción
		reproductionQueue.boundedTextChannel = message.channel;
	
	
		//COMPROBACIÓN DE LÍMITES DE COLA
		//Para comprobar cuantas canciones puede subir un miembro a la cola
	
		//Almacena las pistas autorizadas por usuario
		let authorizedTracks = false;
	
		//Comprueba si los usuarios tienen límite para añadir a la cola
		if (client.config.music.userQueueLimit > 0) {
	
			//Actualiza la variable de pistas con el máximo teórico 
			authorizedTracks = client.config.music.userQueueLimit;
	
			//Calcula cuantas canciones tiene el miembro en la cola
			for (let i = 0; i < reproductionQueue.tracks.length; i++) {
				if (message.member.id === reproductionQueue.tracks[i].requesterId) authorizedTracks--;
			};
	
			//Comprueba si el miembro puede añadir más canciones a la cola
			if (authorizedTracks <= 0) return message.channel.send({ embeds: [ new client.MessageEmbed()
				.setColor(client.config.colors.error)
				.setDescription(`${client.customEmojis.redTick} No puedes añadir más canciones a la cola.`)]
			});
	
		};
	
		//Comprueba si la cola de reproducción está llena
		if (client.config.music.queueLimit !== 0 && reproductionQueue.tracks.length >= client.config.music.queueLimit) return message.channel.send({ embeds: [ new client.MessageEmbed()
			.setColor(client.config.colors.error)
			.setDescription(`${client.customEmojis.redTick} La cola de reproducción está llena.`)]
		});

		//Variable para almacenar el estado de la búsqueda
		let resultFound = false;
	
		//Función para notificar el resultado
		async function showNewQueueItem(trackItem) {

			//Envía un mensaje con el resultado
			if (reproductionQueue.tracks.length > 1) await message.channel.send({ embeds: [ new client.MessageEmbed()
				.setColor(randomColor())
				.setThumbnail(trackItem.meta.thumbnail)
				.setAuthor({ name: 'Añadido a la cola 🎶', iconURL: 'attachment://dj.png' })
				.setDescription(`[${trackItem.meta.title}](${trackItem.meta.location})\n\n● **Autor:** \`${trackItem.meta.author}\`\n● **Duración:** \`${client.functions.msToHHMMSS(trackItem.meta.length)}\`.`)
				.setFooter({ text: await client.functions.getMusicFooter(message.guild), iconURL: client.homeGuild.iconURL({dynamic: true}) })
			], files: ['./resources/images/dj.png'] });
		};
	
		//Comprueba si se quiere reproducir un .mp3 o un streaming de internet
		if (streamType === 'file') {
	
			//Precarga el fichero MP3
			const buffer = client.fs.readFileSync(`./media/audios/${toStream}.mp3`);
	
			//Herramienta para obtener la duración de la pista
			const getMP3Duration = require('get-mp3-duration');
	
			//Crea el objeto de la cola
			const newTrack = await require('./addTrack').run(client, reproductionQueue, false, 'file', message.member.id, {
				location: `./media/audios/${toStream}.mp3`,
				title: toStream,
				author: 'Archivo local',
				length: getMP3Duration(buffer),
				thumbnail: 'attachment://dj.png'
			});
	
			//Avisa sobre la adición a la cola
			showNewQueueItem(newTrack);

			//Almacena el estado de la búsqueda
			resultFound = true;
	
		} else if (streamType === 'stream') {
	
			//Si se proporciona un parámetro de búsqueda, se muestra el menú. Si es una URL, busca los metadatos directamente
			if (toStream.startsWith('http')) {
	
				//Comprueba desde qué servidor se ha de obtener el stream
				if (toStream.includes('youtu')) {
	
					//Comprueba si se trata de una URL de Playlist o de pista
					if (toStream.match(/^.*(list=)([^#\&\?]*).*/)) {
	
						//Si se trata de una URL de Playlist, la maneja directamente
						resultFound = await require('./parsePlaylist').run(client, reproductionQueue, toStream, authorizedTracks, message.member);
	
					} else {
	
						//Busca los metadatos del vídeo de YT
						const playdl = require('play-dl');
						const fetchedUrl = await playdl.video_info(toStream);
						const metadata = fetchedUrl.video_details;
		
						//Comprueba si se han obtenido resultados
						if (!metadata) return message.channel.send({ embeds: [ new client.MessageEmbed()
							.setColor(client.config.colors.error)
							.setDescription(`${client.customEmojis.redTick} No se ha encontrado ningún resultado que coincida con ${args.join(' ')}.`)]
						});
		
						//Comprueba si el resultado es un directo o un vídeo privado
						if (metadata.live || metadata.private) return message.channel.send({ embeds: [ new client.MessageEmbed()
							.setColor(client.config.colors.error)
							.setDescription(`${client.customEmojis.redTick} No se pueden reproducir directos o vídeo privados.`)]
						});

						//Comprueba si el resultado supera la duración máxima establecida
						if (metadata.durationInSec * 1000 > client.config.music.maxTrackDuration) return message.channel.send({ embeds: [ new client.MessageEmbed()
							.setColor(client.config.colors.error)
							.setDescription(`${client.customEmojis.redTick} No se pueden reproducir canciones de más de ${client.functions.msToHHMMSS(client.config.music.maxTrackDuration)}.`)]
						});
		
						//Crea el objeto de la cola
						const newTrack = await require('./addTrack').run(client, reproductionQueue, false, 'stream', message.member.id, metadata);

						//Almacena el estado de la búsqueda
						resultFound = true;
	
						//Avisa sobre la adición a la cola
						showNewQueueItem(newTrack);
	
					};
	
				} else {
	
					//Devuelve un error si no se ha proporcionado una URL válida
					return message.channel.send({ embeds: [ new client.MessageEmbed()
						.setColor(client.config.colors.error)
						.setDescription(`${client.customEmojis.redTick} Por el momento, <@${client.user.id}> solo puede obtener canciones desde YouTube.`)]
					});
				};
	
			} else {

				//Busca los metadatos
				const playdl = require('play-dl');
				
				//Realiza la búsqueda
				await playdl.search(args.join(' '), {limit: 10}).then(async results => {
	
					//Comprueba si se han obtenido resultados
					if (!results || results.length === 0) return message.channel.send({ embeds: [ new client.MessageEmbed()
						.setColor(client.config.colors.error)
						.setDescription(`${client.customEmojis.redTick} No se ha encontrado ningún resultado que encaje con \`${args.join(' ')}\`.`)]
					});
	
					//Si solo hay un resultado, no muestra menú
					if (results.length == 1) {

						//Comprueba si el resultado es un directo o un vídeo privado
						if (results[0].live || results[0].private) return message.channel.send({ embeds: [ new client.MessageEmbed()
							.setColor(client.config.colors.error)
							.setDescription(`${client.customEmojis.redTick} No se pueden reproducir directos o vídeo privados.`)]
						});

						//Comprueba si el resultado supera la duración máxima establecida
						if (results[0].durationInSec * 1000 > client.config.music.maxTrackDuration) return message.channel.send({ embeds: [ new client.MessageEmbed()
							.setColor(client.config.colors.error)
							.setDescription(`${client.customEmojis.redTick} No se pueden reproducir canciones de más de ${client.functions.msToHHMMSS(client.config.music.maxTrackDuration)}.`)]
						});
	
						//Crea el objeto de la cola
						const newTrack = await require('./addTrack').run(client, reproductionQueue, false, 'stream', message.member.id, results[0]);

						//Almacena el estado de la búsqueda
						resultFound = true;
	
						//Avisa sobre la adición a la cola
						showNewQueueItem(newTrack);
	
					} else {
	
						//Si hubo más de un resultado, muestra un menú
						let formattedResults = ''; //Almacena el string del menú
						let pointer = 1; //Almacena el puntero que indica el número de resultado en el menú
						let asociatedPositions = {}; //Asocia la posición del puntero con la posición en la lista de resultados
	
						//Para cada resultado, evalúa si ha de ser añadido a la lista
						for (let i = 0; i < results.length; i++) {
	
							//Solo añade el resultado si es una playlist, o un vídeo (que no esté en directo, no sea privado y no sea más largo de lo estipulado en la config.)
							if (results[i].type === 'playlist' || (results[i].type === 'video' && results[i].durationRaw && results[i].title !== '[Private video]' && results[i].durationInSec * 1000 <= client.config.music.maxTrackDuration)) {
	
								asociatedPositions[pointer] = i; //Crea la asociación puntero-posición
								let title = results[i].title; //Almacena el título
								title = title.replace('[', '').replace(']', '').replace('|', '').replace('(', '').replace(')', '').replace('_', '').replace('*', ''); //Elimina signos que alteren la forma en la que se muestra la entrada
	
								if (title.length > 40) title = `${title.slice(0, 40)} ...`; //Acorta el título si es demasiado largo
								if (results[i].type === 'playlist') { //Si se trata de una playlist, almacena el string "playlist" en vez de la duración de la pista
									formattedResults = `${formattedResults}\n\`${pointer}.\` - [${title}](${results[i].url}) | \`${results[i].type}\``;
								} else { //Si se trata de un vídeo, almacena la duración de la pista en vez de el string "playlist"
									formattedResults = `${formattedResults}\n\`${pointer}.\` - [${title}](${results[i].url}) | \`${results[i].durationRaw}\``;
								};
								pointer ++; //Incremento de puntero
							};
						};
	
						//Se espera a que el miembro elija una pista de la lista
						await message.channel.send({ embeds: [ new client.MessageEmbed()
							.setColor(randomColor())
							.setAuthor({ name: 'Elige una pista 🎶', iconURL: 'attachment://dj.png' })
							.setDescription(formattedResults)
						], files: ['./resources/images/dj.png'] }).then(async msg => {
	
							const filter = msg => msg.author.id === message.member.id;
	
							await msg.channel.awaitMessages({filter, max: 1, time: 60000}).then(async collected => {    //<--- MAL
	
								let option = collected.first().content; //Almacena la opción elegida
								setTimeout(() => collected.first().delete(), 2000); //Borra el mensaje de elección
								option = parseInt(option); //Parsea la opción
	
								//Maneja si la elección es errónea
								if (isNaN(option) || option < 1 || option > pointer - 1) {

									msg.delete();	//Elimina el menú de resultados

									return message.channel.send({ embeds: [ new client.MessageEmbed()
										.setColor(client.config.colors.error)
										.setDescription(`${client.customEmojis.redTick} Debes escoger una pista de la lista.`)]
									});
								};
	
								//Busca el resultado en la lista de asociaciones en función de la opción elegida
								option = asociatedPositions[option];
	
								//Borra el menú
								setTimeout(() => msg.delete(), 2000);
	
								//Maneja el resultado en función de si es una playlist o un vídeo
								if (results[option].type === 'playlist') {
									require('./parsePlaylist').run(reproductionQueue, results[option].url, authorizedTracks, message.member); //Maneja la playlist
								} else if (results[option].type === 'video') {
									
									//Crea el objeto de la cola
									const newTrack = await require('./addTrack').run(client, reproductionQueue, false, 'stream', message.member.id, results[option]);

									//Almacena el estado de la búsqueda
									resultFound = true;
	
									//Avisa sobre la adición a la cola
									showNewQueueItem(newTrack);
	
								} else {
	
									//Si es un tipo de resultado inesperado, lo maneja y lanza un error
									return message.channel.send({ embeds: [ new client.MessageEmbed()
										.setColor(client.config.colors.error)
										.setDescription(`${client.customEmojis.redTick} No se puede reproducir este resultado.`)]
									});
								};
							}).catch(() => msg.delete()); //Si el miembro no responde, borra el menú
						});
					};
				});
			};
	
		} else {
			return console.error(`${new Date().toLocaleString()} 》No se ha proporcionado un valor válido para el parámetro "streamType".`);
		};

		//Devuelve el estado de la búsqueda
		return resultFound;
		
	} catch (error) {

		if (error.message.includes('Sign in to confirm your age')) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.orangeTick} Por el momento, no puedo reproducir vídeos con restricción de edad.`)]
        });

		//Maneja el error
        await client.functions.commandErrorHandler(error, message, args.shift().toLowerCase(), args);
    };
};
