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

                //
                let reportEmbed = new client.MessageEmbed()
                    .setColor(client.config.colors.warning)
                    .setAuthor({ name: `${interaction.member.user.tag} ha reportado lo siguiente:`, iconURL: interaction.member.user.displayAvatarURL({dynamic: true}) })
                    .setFields([
                        { name: 'Motivo del reporte', value: reportReason, inline: true },
                        { name: 'Canal del reporte', value: `<#${interaction.channelId}>`, inline: true }
                    ])
                    .setTimestamp()

                //
                if (reportedMember) reportEmbed.addFields([
                    { name: 'Miembro reportado', value: `${reportedMember}`, inline: true }

                ]);

                //
                if (reportedMessage) reportEmbed.addFields([
                    { name: 'Mensaje reportado', value: reportedMessage.content.length > 0 ? reportedMessage.content : '`Inserción`', inline: true },
                    { name: 'ID del mensaje', value: `[${reportedMessage.id}](${reportedMessage.url})`, inline: true }
                ]);
                
                //
                if (reportedMessage && reportedMessage.attachments.size > 0 ) {

                    const chunkSize = 5; // 1-9
                    const chunks = Math.ceil(reportedMessage.attachments.size / chunkSize);
                    const attachmentsArray = Array.from(reportedMessage.attachments.values());

                    //
                    for (let currentChunk = 1; currentChunk <= chunks; currentChunk++) {

                        //
                        let attachments = [];

                        //
                        for (let index = chunkSize * (currentChunk - 1); index <= chunkSize * currentChunk - 1; index++) {

                            //
                            if (index >= attachmentsArray.length) break;

                            //
                            attachments.push(`[Archivo ${index + 1} [${attachmentsArray[index].contentType}]](${attachmentsArray[index].url})`)
                        };

                        //
                        reportEmbed.addFields([
                            { name: `Archivos adjuntos [${currentChunk}/${chunks}]`, value: attachments.join(', '), inline: false }
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
