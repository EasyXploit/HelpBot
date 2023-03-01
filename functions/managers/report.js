//Función para gestionar el envío de reportes al canal de reportes
exports.run = async (client, interaction, modalInteraction, reportReason, reportedMember) => {

    //Comprobar si el canal de reportes está configurado y almacenado en memoria
    if (client.config.main.reportsChannel && client.reportsChannel) {

        //Almacena las traducciones
        const locale = client.locale.functions.managers.report;

        try {

            //Carga los permisos del bot en el canal de logging
            const channelPermissions = client.reportsChannel.permissionsFor(client.user);
            const missingPermission = ((channelPermissions & BigInt(0x800)) !== BigInt(0x800) || (channelPermissions & BigInt(0x4000)) !== BigInt(0x4000) || (channelPermissions & BigInt(0x8000)) !== BigInt(0x8000));

            //Comprueba si el bot tiene permisos para mandar el contenido
            if (!missingPermission) {

                //Almacena el mensaje reportado
                const reportedMessage = interaction.options._hoistedOptions[0] ? interaction.options._hoistedOptions[0].message : null;

                //Se genera un embed base para el reporte
                let reportEmbed = new client.MessageEmbed()
                    .setColor(client.config.colors.warning)
                    .setAuthor({ name: `${await client.functions.utilities.parseLocale.run(locale.reportEmbed.author, { memberTag: interaction.member.user.tag })}:`, iconURL: interaction.member.user.displayAvatarURL({dynamic: true}) })
                    .setFields([
                        { name: locale.reportEmbed.reportReason, value: reportReason, inline: true },
                        { name: locale.reportEmbed.reportChannel, value: `<#${interaction.channelId}>`, inline: true }
                    ])
                    .setTimestamp()

                //Si se proporcionó un miembro reportado, añade el cambo al embed
                if (reportedMember) reportEmbed.addFields([
                    { name: locale.reportEmbed.reportedMember, value: `${reportedMember}`, inline: true }

                ]);

                //Si se proporcionó un mensaje reportado, añade el cambo al embed
                if (reportedMessage) reportEmbed.addFields([
                    { name: locale.reportEmbed.reportedMessage, value: reportedMessage.content.length > 0 ? reportedMessage.content : `\`${locale.reportEmbed.isInsertion}\``, inline: true },
                    { name: locale.reportEmbed.reportedMessageId, value: `[${reportedMessage.id}](${reportedMessage.url})`, inline: true }
                ]);
                
                //Si se proporcionó un mensaje reportado y este tenía adjuntos
                if (reportedMessage && reportedMessage.attachments.size > 0 ) {

                    //Almacena la cantidad de archivos por campo del embed
                    const chunkSize = 5; // Valores seguros: 1-9

                    //Almacena el número total de bloques
                    const totalChunks = Math.ceil(reportedMessage.attachments.size / chunkSize);

                    //Obtiene un array con los adjuntos del mensaje reportado
                    const attachmentsArray = Array.from(reportedMessage.attachments.values());

                    //Por cada uno de los bloques del total calculado
                    for (let currentChunk = 1; currentChunk <= totalChunks; currentChunk++) {

                        //Genera un array par almacenar los asjuntos procesados
                        let attachments = [];

                        //Por cada uno de los adjuntos que sorresponden a este bloque
                        for (let index = chunkSize * (currentChunk - 1); index <= chunkSize * currentChunk - 1; index++) {

                            //Si se alcanza el total de adjuntos, para el bucle
                            if (index >= attachmentsArray.length) break;

                            //Genera un string enlazado a la descarga del fichero para añadirla al campo
                            attachments.push(`[${await client.functions.utilities.parseLocale.run(locale.reportEmbed.fileName, { fileNumber: index + 1, fileType: attachmentsArray[index].contentType})}](${attachmentsArray[index].url})`)
                        };

                        //Adjunta todos los campos generados para los adjuntos al embed del reporte
                        reportEmbed.addFields([
                            { name: await client.functions.utilities.parseLocale.run(locale.reportEmbed.attachedFiles, { currentChunk: currentChunk, totalChunks: totalChunks}), value: attachments.join(', '), inline: false }
                            
                        ]);
                    };
                };

                //Envía un mensaje de confirmación
                await (modalInteraction ? modalInteraction : interaction).reply({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.secondaryCorrect)
                    .setDescription(`${client.customEmojis.greenTick} ${locale.correct}.`)
                ], ephemeral: true});

                //Se formatea y envía un registro al canal de reportes especificado en la configuración
                await client.reportsChannel.send({ embeds: [ reportEmbed ]});

            } else {
                
                //Envía un mensaje de error al usuario
                await (modalInteraction ? modalInteraction : interaction).reply({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${locale.temporaryError}.`)
                ], ephemeral: true});

                //Advertir por consola de que no se tienen permisos
                console.error(`${new Date().toLocaleString()} 》${await client.functions.utilities.parseLocale.run(locale.cannotSend, { botUser: client.user.username })}.`);
            };

        } catch (error) {

            //Si el canal no es accesible
            if (error.toString().includes('Unknown Channel')) {

                //Borrarlo de la config y descargarlo de la memoria
                client.config.main.reportsChannel = '';
                client.reportsChannel = null;

                //Advertir por consola
                console.error(`${new Date().toLocaleString()} 》${locale.cannotAccess}.`);

                //Graba la nueva configuración en el almacenamiento
                await client.fs.writeFile('./configs/main.json', JSON.stringify(client.config.main, null, 4), async err => { if (err) throw err });

            } else {

                //Muestra un error por consola
                console.error(`${new Date().toLocaleString()} 》${locale.error}:`, error.stack);
            };
        };
    };
};
