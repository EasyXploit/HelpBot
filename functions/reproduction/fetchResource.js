const { slice } = require('lodash');

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
		if (['mp3', 'ogg', 'opus'].includes(streamType)) {
	
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

							//Notifica si el error se debe a una restricción por copyright regional
							if (error.toString().includes('Video unavailable')) return await reproductionQueue.boundedTextChannel.send({ embeds: [ new client.MessageEmbed()
								.setColor(client.config.colors.warning)
								.setDescription(`${client.customEmojis.orangeTick} ${client.locale.functions.reproduction.fetchResource.copyrightedVideo}.`)]
							});

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
				await playdl.search(toStream, {limit: 20}).then(async results => {
	
					//Comprueba si se han obtenido resultados
					if (!results || results.length === 0) return interactionChannel.send({ embeds: [ new client.MessageEmbed()
						.setColor(client.config.colors.error)
						.setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.noResults, { searchInput: toStream })}.`)
					], ephemeral: true});
	
					//Si solo hay un resultado, no muestra menú
					if (results.length == 1) {

						//Comprueba si el resultado es un vídeo privado
						if (results[0].private) return interactionChannel.send({ embeds: [ new client.MessageEmbed()
							.setColor(client.config.colors.error)
							.setDescription(`${client.customEmojis.redTick} ${locale.cantPlayPrivate}.`)
						], ephemeral: true});

						//Comprueba si el resultado supera la duración máxima establecida
						if (musicConfig.maxTrackDuration > 0 && (results[0].durationInSec * 1000 > musicConfig.maxTrackDuration || results[0].durationInSec * 1000 < 0)) return interactionChannel.send({ embeds: [ new client.MessageEmbed()
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

						//Almacena la lista de opciones del selector
						let optionsList = [];
	
						//Para cada resultado, evalúa si ha de ser añadido a la lista
						for (let index = 0; index < results.length; index++) {

							//Almacena el resultado iterado
							const result = results[index];

							//Convierte la duración a milisegundos
							const milliseconds = result.durationInSec * 1000;

							//Acorta el título si es demasiado largo
							const title = result.title.length <= 90 ? result.title : `${result.title.slice(0, 90)} ...`; 
	
							//Solo añade el resultado si es una playlist, o un vídeo (que no esté en directo y no sea privado)
							if (result.type === 'playlist' || (result.type === 'video' && !result.private)) {

								//Omite si el vídeo excede la duración máxima, o es un directo
								if (musicConfig.maxTrackDuration > 0 && (milliseconds > musicConfig.maxTrackDuration || milliseconds <= 0)) continue;

								//Si se trata de una playlist, almacena el string "playlist" en vez de la duración de la pista
								if (result.type === 'playlist') {

									//Genera y recorta si es necesario el campo de descripción de la opción
									let description = `${locale.selectMenu.playlist} | ${result.channel.name}`;
									description.length <= 90 ? description : `${description.slice(0, 90)} ...`; 

									//Genera y almacena la opción del selector para la pista
									optionsList.push({
										label: `🎶 | ${title}`,
										description: description,
										value: index.toString(),
									});

								} else { //Si se trata de un vídeo, almacena la duración de la pista en vez de el string "playlist"

									//Genera y recorta si es necesario el campo de descripción de la opción
									let description = `${result.durationInSec > 0 ? result.durationRaw : locale.selectMenu.direct} | ${result.channel.name}`;
									description.length <= 90 ? description : `${description.slice(0, 90)} ...`;

									//Genera y almacena la opción del selector para la pista
									optionsList.push({
										label: `${result.durationInSec > 0 ? '🎵' : '📻'} | ${title}`,
										description: description,
										value: index.toString(),
									});
								};
							};
						};

						//Añade una opción para seleccionar una opción aleatoria
						optionsList.push({
							label: `🔀 | ${locale.selectMenu.randomOption.label}`,
							description: locale.selectMenu.randomOption.description,
							value: 'random',
						});

						//Añade una opción para abortar la selección
						optionsList.push({
							label: `❌ | ${locale.selectMenu.cancelOption.label}`,
							description: locale.selectMenu.cancelOption.description,
							value: 'cancel',
						});

						//Devuelve un error si no se encontraron resultados
						if (optionsList.length === 2) return interaction.reply({ embeds: [ new client.MessageEmbed()
							.setColor(client.config.colors.error)
							.setDescription(`${client.customEmojis.redTick} ${locale.selectMenu.invalidResults}.`)
						], ephemeral: true});

						//Genera una fila para el selector
						const selectorRow = new client.MessageActionRow()
							.addComponents(
								new client.MessageSelectMenu()
									.setCustomId('play-result-search')
									.setPlaceholder(locale.selectMenu.placeholder)
									.addOptions(optionsList),
							);

						//Envía el selector y ejecuta el callback
						await interactionChannel.send({ components: [selectorRow] }).then(async selectMenuMessage => {

							//Genera un filtro de selectores
							const selectorsFilter = (selectInteraction) => {

								//Si el selector fue enviado por el ejecutor del comando, dispara el filtro
								if (selectInteraction.member.id === interaction.member.id) return true;

								//Si el selector no fue enviado por el ejecutor del comando, devuelve un error
								return selectInteraction.reply({ embeds: [ new client.MessageEmbed()
									.setColor(client.config.colors.error)
									.setDescription(`${client.customEmojis.redTick} ${locale.selectMenu.cantUseSelector}.`)
								], ephemeral: true});
							};

							//Espera selecciones del selector en el mensaje
							await selectMenuMessage.awaitMessageComponent({ filter: selectorsFilter, time: 60000  }).then(async selectInteraction => {

								//Almacena la opción seleccionada
								let selectedOption = selectInteraction.values[0];

								//Elige una opción aleatoria si se ha seleccionado dicha opción
								if (selectedOption === 'random') selectedOption = Math.floor(Math.random() * (optionsList.length - 3));

								//Aborta si se desea cancelar la búsqueda
								if (selectedOption === 'cancel') return await selectMenuMessage.edit({ content: `❌ | ${locale.selectMenu.cancelledSearch}`, components: [] });

								//Borra el selector
								setTimeout(() => selectMenuMessage.delete(), 2000);

								//Maneja el resultado en función de si es una playlist o un vídeo
								if (results[selectedOption].type === 'playlist') await client.functions.reproduction.parsePlaylist.run(reproductionQueue, results[selectedOption].url, authorizedTracks, interaction.member, interaction); //Maneja la playlist
								else if (results[selectedOption].type === 'video') {
									
									//Crea el objeto de la cola
									const newTrack = await client.functions.reproduction.addTrack.run(client, reproductionQueue, false, 'stream', interaction.member.id, results[selectedOption], interaction);

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

							//Si no se ha elegido en el tiempo esperado
							}).catch(async error => {

								//Si no es un error por borrado del mensaje
								if (!error.toString().includes('messageDelete')) {

									//Edita el mensaje indicando que el selector ha expirado
									await selectMenuMessage.edit({ content: `❌ | ${locale.selectMenu.expiredSearch}`, components: [] });
								};
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
