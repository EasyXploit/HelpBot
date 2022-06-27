//Función para obtener una pista de audio
exports.run = async (client, interaction, streamType, toStream) => {

	try {

		//Herramienta para generar colores aleatorios
		const randomColor = require('randomcolor');

		//Almacena las traducciones
		const locale = client.locale.functions.reproduction.fetchResource;
		
		//Comprueba si debe crear el objeto global de colas
		if (!client.reproductionQueues[interaction.guild.id]) client.reproductionQueues[interaction.guild.id] = { boundedTextChannel: null, timeout: null, votes: {}, mode: false, tracks: [] };
	
		//Almacena el objeto de colas de la guild
		const reproductionQueue = client.reproductionQueues[interaction.guild.id];

		 //Almacena el canal de texto de la interacción
		 const interactionChannel = await client.functions.utilities.fetch.run(client, 'channel', interaction.channelId);
	
		//Almacena el canal del mensaje para vincular los mensajes de reproducción
		reproductionQueue.boundedTextChannel = interactionChannel;

		//COMPROBACIÓN DE LÍMITES DE COLA
		//Para comprobar cuantas pistas puede subir un miembro a la cola
	
		//Almacena las pistas autorizadas por usuario
		let authorizedTracks = false;

		//Almacena la configuración de música
		const musicConfig = client.config.music;
	
		//Comprueba si los usuarios tienen límite para añadir a la cola
		if (musicConfig.userQueueLimit > 0) {
	
			//Actualiza la variable de pistas con el máximo teórico 
			authorizedTracks = musicConfig.userQueueLimit;
	
			//Calcula cuantas pistas tiene el miembro en la cola
			for (let index = 0; index < reproductionQueue.tracks.length; index++) {
				if (interaction.member.id === reproductionQueue.tracks[index].requesterId) authorizedTracks--;
			};
	
			//Comprueba si el miembro puede añadir más pistas a la cola
			if (authorizedTracks <= 0) return interaction.reply({ embeds: [ new client.MessageEmbed()
				.setColor(client.config.colors.error)
				.setDescription(`${client.customEmojis.redTick} ${locale.cantAddMore}.`)
			], ephemeral: true});
		};
	
		//Comprueba si la cola de reproducción está llena
		if (musicConfig.queueLimit !== 0 && reproductionQueue.tracks.length >= musicConfig.queueLimit) return interaction.reply({ embeds: [ new client.MessageEmbed()
			.setColor(client.config.colors.error)
			.setDescription(`${client.customEmojis.redTick} ${locale.fullQueue}.`)
		], ephemeral: true});

		//Variable para almacenar el estado de la búsqueda
		let resultFound = false;
	
		//Función para notificar el resultado
		async function showNewQueueItem(trackItem) {

			//Envía un mensaje con el resultado
			if (reproductionQueue.tracks.length > 1) await interactionChannel.send({ embeds: [ new client.MessageEmbed()
				.setColor(randomColor())
				.setThumbnail(trackItem.meta.thumbnail)
				.setAuthor({ name: `${locale.newItemEmbed.authorTitle} 🎶`, iconURL: 'attachment://dj.png' })
				.setDescription(`[${trackItem.meta.title}](${trackItem.meta.location})\n\n● **${locale.newItemEmbed.author}:** \`${trackItem.meta.author}\`\n● **${locale.newItemEmbed.duration}:** \`${await client.functions.utilities.msToTime.run(client, trackItem.meta.length)}\``)
				.setFooter({ text: await client.functions.reproduction.getFooter.run(client, interaction.guild) })
			], files: ['./resources/images/dj.png'] });
		};
	
		//Comprueba si se quiere reproducir un audio local o un streaming de internet
		if (['mp3', 'ogg'].includes(streamType)) {
	
			//Herramienta para obtener la duración de la pista
			const { getAudioDurationInSeconds } = require('get-audio-duration');

			//Almacena la duración de la pista
			const duration = await getAudioDurationInSeconds(`./storage/audios/${toStream}.${streamType}`) * 1000;

			//Busca el miembro autor del audio en la guild
			const audioAuthor = await client.functions.utilities.fetch.run(client, 'member', client.db.audios[toStream].ownerId) || `\`${locale.unknownAudioAuthor}\``;
	
			//Crea el objeto de la cola
			const newTrack = await client.functions.reproduction.addTrack.run(client, reproductionQueue, false, streamType, interaction.member.id, {
				location: `./storage/audios/${toStream}.${streamType}`,
				title: toStream,
				author: audioAuthor,
				length: duration,
				thumbnail: 'attachment://dj.png'
			}, interaction);

			//Si se añadió la pista
			if (newTrack) {
	
				//Avisa sobre la adición a la cola
				showNewQueueItem(newTrack);

				//Almacena el estado de la búsqueda
				resultFound = true;
			};
	
		} else if (streamType === 'stream') {
	
			//Si se proporciona un parámetro de búsqueda, se muestra el menú. Si es una URL, busca los metadatos directamente
			if (toStream.startsWith('http')) {
	
				//Comprueba desde qué servidor se ha de obtener el stream
				if (toStream.includes('youtu')) {
	
					//Comprueba si se trata de una URL de Playlist o de pista
					if (toStream.match(/^.*(list=)([^#\&\?]*).*/)) {
	
						//Si se trata de una URL de Playlist, la maneja directamente
						resultFound = await client.functions.reproduction.parsePlaylist.run(client, reproductionQueue, toStream, authorizedTracks, interaction.member, interaction);
	
					} else {

						//Almacena los metadatos de la pista
						let metadata = null;

						try {
	
							//Busca los metadatos del vídeo de YT
							const playdl = require('play-dl');
							const fetchedUrl = await playdl.video_info(toStream);
							metadata = fetchedUrl.video_details;

						} catch (error) { 

							//Notifica si el error se debe a una restricción de edad por falta de cookies
							if (error.toString().includes('Sign in to confirm your age')) return await reproductionQueue.boundedTextChannel.send({ embeds: [ new client.MessageEmbed()
								.setColor(client.config.colors.warning)
								.setDescription(`${client.customEmojis.orangeTick} ${locale.ageRestricted}.`)
							]});

							//Notifica si el error se debe a que no es una URL válida
							if (error.toString().includes('This is not a YouTube Watch URL')) return await reproductionQueue.boundedTextChannel.send({ embeds: [ new client.MessageEmbed()
								.setColor(client.config.colors.error)
								.setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.noResults, { searchInput: toStream })}.`)
							]});

							//Ejecuta el manejador de errores
							return await client.functions.managers.interactionError.run(client, error, interaction);
						};

						//Comprueba si se han obtenido resultados
						if (!metadata) return await reproductionQueue.boundedTextChannel.send({ embeds: [ new client.MessageEmbed()
							.setColor(client.config.colors.error)
							.setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.noResults, { searchInput: toStream })}.`)
						]});

						//Comprueba si el resultado es un directo o un vídeo privado
						if (metadata.private) return interaction.reply({ embeds: [ new client.MessageEmbed()
							.setColor(client.config.colors.error)
							.setDescription(`${client.customEmojis.redTick} ${locale.cantPlayPrivate}.`)
						], ephemeral: true});

						//Comprueba si el resultado supera la duración máxima establecida
						if (musicConfig.maxTrackDuration > 0 && (metadata.durationInSec * 1000 > musicConfig.maxTrackDuration || metadata.durationInSec * 1000 < 0)) return interaction.reply({ embeds: [ new client.MessageEmbed()
							.setColor(client.config.colors.error)
							.setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.exceededLength, { duration: await client.functions.utilities.msToTime.run(client, musicConfig.maxTrackDuration) })}.`)
						], ephemeral: true});
		
						//Crea el objeto de la cola
						const newTrack = await client.functions.reproduction.addTrack.run(client, reproductionQueue, false, 'stream', interaction.member.id, metadata, interaction);

						//Si se añadió la pista
						if (newTrack) {

							//Almacena el estado de la búsqueda
							resultFound = true;

							//Avisa sobre la adición a la cola
							showNewQueueItem(newTrack);
						};
					};
	
				} else {
	
					//Devuelve un error si no se ha proporcionado una URL válida
					return interaction.reply({ embeds: [ new client.MessageEmbed()
						.setColor(client.config.colors.error)
						.setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.onlyFromYouTube, { botUser: client.user })}.`)
					], ephemeral: true});
				};
	
			} else {

				//Busca los metadatos
				const playdl = require('play-dl');
				
				//Realiza la búsqueda
				await playdl.search(toStream, {limit: 10}).then(async results => {
	
					//Comprueba si se han obtenido resultados
					if (!results || results.length === 0) return interaction.reply({ embeds: [ new client.MessageEmbed()
						.setColor(client.config.colors.error)
						.setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.noResults, { searchInput: toStream })}.`)
					], ephemeral: true});
	
					//Si solo hay un resultado, no muestra menú
					if (results.length == 1) {

						//Comprueba si el resultado es un vídeo privado
						if (results[0].private) return interaction.reply({ embeds: [ new client.MessageEmbed()
							.setColor(client.config.colors.error)
							.setDescription(`${client.customEmojis.redTick} ${locale.cantPlayPrivate}.`)
						], ephemeral: true});

						//Comprueba si el resultado supera la duración máxima establecida
						if (musicConfig.maxTrackDuration > 0 && (results[0].durationInSec * 1000 > musicConfig.maxTrackDuration || results[0].durationInSec * 1000 < 0)) return interaction.reply({ embeds: [ new client.MessageEmbed()
							.setColor(client.config.colors.error)
							.setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.exceededLength, { duration: await client.functions.utilities.msToTime.run(client, musicConfig.maxTrackDuration) })}.`)
						], ephemeral: true});
	
						//Crea el objeto de la cola
						const newTrack = await client.functions.reproduction.addTrack.run(client, reproductionQueue, false, 'stream', interaction.member.id, results[0], interaction);

						//Si se añadió la pista
						if (newTrack) {

							//Almacena el estado de la búsqueda
							resultFound = true;
		
							//Avisa sobre la adición a la cola
							showNewQueueItem(newTrack);
						};
	
					} else {
	
						//Si hubo más de un resultado, muestra un menú
						let formattedResults = ''; //Almacena el string del menú
						let pointer = 1; //Almacena el puntero que indica el número de resultado en el menú
						let asociatedPositions = {}; //Asocia la posición del puntero con la posición en la lista de resultados
	
						//Para cada resultado, evalúa si ha de ser añadido a la lista
						for (let index = 0; index < results.length; index++) {

							//Almacena el resultado iterado
							const result = results[index];

							//Convierte la duración a milisegundos
							const milliseconds = result.durationInSec * 1000;
	
							//Solo añade el resultado si es una playlist, o un vídeo (que no esté en directo y no sea privado)
							if (result.type === 'playlist' || (result.type === 'video' && !result.private)) {

								//Omite si el vídeo excede la duración máxima, o es un directo
								if (musicConfig.maxTrackDuration > 0 && (milliseconds > musicConfig.maxTrackDuration || milliseconds <= 0)) continue;
	
								//Crea la asociación puntero-posición
								asociatedPositions[pointer] = index;

								//Almacena el título y elimina signos que alteren la forma en la que se muestra la entrada
								let title = result.title.replace('[', '').replace(']', '').replace('|', '').replace('(', '').replace(')', '').replace('_', '').replace('*', '');
	
								//Acorta el título si es demasiado largo
								if (title.length > 40) title = `${title.slice(0, 40)} ...`; 

								if (result.type === 'playlist') { //Si se trata de una playlist, almacena el string "playlist" en vez de la duración de la pista
									formattedResults = `${formattedResults}\n\`${pointer}.\` - [${title}](${result.url}) | \`${result.type}\``;
								} else { //Si se trata de un vídeo, almacena la duración de la pista en vez de el string "playlist"
									formattedResults = `${formattedResults}\n\`${pointer}.\` - [${title}](${result.url}) | \`${result.durationInSec > 0 ? result.durationRaw : 'Directo'}\``;
								};

								pointer ++; //Incremento de puntero
							};
						};

						//Devuelve un error si no se encontraron resultados
						if (Object.keys(asociatedPositions).length === 0) return interaction.reply({ embeds: [ new client.MessageEmbed()
							.setColor(client.config.colors.error)
							.setDescription(`${client.customEmojis.redTick} ${locale.invalidResults}.`)
						], ephemeral: true});
	
						//Se espera a que el miembro elija una pista de la lista
						await interactionChannel.send({ embeds: [ new client.MessageEmbed()
							.setColor(randomColor())
							.setAuthor({ name: `${locale.selectionEmbed.author} 🎶`, iconURL: 'attachment://dj.png' })
							.setFooter({ text: `${locale.selectionEmbed.footer}.` })
							.setDescription(formattedResults)
						], files: ['./resources/images/dj.png'] }).then(async msg => {

							//Reacciona con un emoji para cancelar
							await msg.react('❌');

							//Crea un filtro de reacciones
							const reactionsFilter = (reaction, user) => reaction.emoji.name === '❌' && user.id === interaction.member.id;

							//Crea un colector de reacciones que encajen con el filtro
							const reactionsCollector = await msg.createReactionCollector({ filter: reactionsFilter, max: 1, time: 60000 });

							//Borra el mensaje si el colector colecciona
							reactionsCollector.on('collect', () => msg.delete());
							
							//Crea un filtro de mensajes
							const messagesFilter = m => m.author.id === interaction.member.id;
	
							//Crea un colector de mensajes que encajen con el filtro
							await msg.channel.awaitMessages({filter: messagesFilter, max: 1, time: 60000}).then(async collected => {

								//No ejecuta el resto del programa si el mensaje fue borrado mediante reacción
								if (!interactionChannel.messages.cache.get(msg.id)) return;
	
								let option = collected.first().content; //Almacena la opción elegida
								setTimeout(() => collected.first().delete(), 2000); //Borra el mensaje de elección
								option = parseInt(option); //Parsea la opción
	
								//Maneja si la elección es errónea
								if (isNaN(option) || option < 1 || option > pointer - 1) {

									msg.delete();	//Elimina el menú de resultados

									//Envía un mensaje de error
									return interactionChannel.send({ embeds: [ new client.MessageEmbed()
										.setColor(client.config.colors.error)
										.setDescription(`${client.customEmojis.redTick} ${locale.didntChoose}.`)]
									});
								};
	
								//Busca el resultado en la lista de asociaciones en función de la opción elegida
								option = asociatedPositions[option];
	
								//Borra el menú
								setTimeout(() => msg.delete(), 2000);
	
								//Maneja el resultado en función de si es una playlist o un vídeo
								if (results[option].type === 'playlist') await client.functions.reproduction.parsePlaylist.run(reproductionQueue, results[option].url, authorizedTracks, interaction.member, interaction); //Maneja la playlist
								else if (results[option].type === 'video') {
									
									//Crea el objeto de la cola
									const newTrack = await client.functions.reproduction.addTrack.run(client, reproductionQueue, false, 'stream', interaction.member.id, results[option], interaction);

									//Si se añadió la pista
									if (newTrack) {

										//Almacena el estado de la búsqueda
										resultFound = true;
		
										//Avisa sobre la adición a la cola
										showNewQueueItem(newTrack);
									};
	
								} else {
	
									//Si es un tipo de resultado inesperado, lo maneja y lanza un error
									return interactionChannel.send({ embeds: [ new client.MessageEmbed()
										.setColor(client.config.colors.error)
										.setDescription(`${client.customEmojis.redTick} ${locale.cantPlay}.`)]
									});
								};
							}).catch(() => {

								//Borra el mensaje si este no fue borrado previamente por una reacción de aborción
								msg.delete().catch((error) => {
									if (error.httpStatus !== 404) console.error(`${new Date().toLocaleString()} 》ERROR: `, error.stack);
								});
							});
						});
					};
				});
			};
		};

		//Devuelve el estado de la búsqueda
		return resultFound;
		
	} catch (error) {

		//Notifica si el error se debe a una restricción de edad por falta de cookies
		if (error.message.includes('Sign in to confirm your age')) return client.reproductionQueues[interaction.guild.id].boundedTextChannel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.warning)
            .setDescription(`${client.customEmojis.orangeTick} ${client.locale.functions.reproduction.fetchResource.ageRestricted}.`)]
        });

		//Ejecuta el manejador de errores
        await client.functions.managers.interactionError.run(client, error, interaction);
    };
};
