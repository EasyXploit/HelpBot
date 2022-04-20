exports.run = async (client, message, args, command, commandConfig, locale) => {
    
    try {

        //Envía un mensaje de error si no se ha proporcionado un parámetro (comando)
        if (!args[0]) return await client.functions.syntaxHandler(message.channel, commandConfig);

        //En función del comando especificado
        switch (args[0]) {
            
            case 'welcome': //Emite el evento "guildMemberAdd"
                
                //Devuelve un error si no se ha proporcionado un miembro
                if (!args[1]) return message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${locale.welcome.memberNotProvided}.`)
                ]});

                //Busca el miembro en la guild
                const targetWelcomeMember = await client.functions.fetchMember(message.guild, args[1]);

                //Devuelve un error si no se ha proporcionado un miembro válido
                if (!targetWelcomeMember) return message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${locale.welcome.invalidMember}.`)
                ]});
                
                //Emite el evento
                await client.emit('guildMemberAdd', targetWelcomeMember);

                //Envía un mensaje de confirmación
                await message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.secondaryCorrect)
                    .setDescription(`${client.customEmojis.greenTick} ${locale.welcome.done}`)
                ]}).then(msg => {setTimeout(() => msg.delete(), 2000)});

                //Para la ejecución
                break;
        
            case 'goodbye': //Emite el evento "guildMemberRemove"
                
                //Devuelve un error si no se ha proporcionado un miembro
                if (!args[1]) return message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${locale.goodbye.memberNotProvided}.`)
                ]});

                //Busca el miembro en la guild
                const targetGoodybeMember = await client.functions.fetchMember(message.guild, args[1]);

                //Devuelve un error si no se ha proporcionado un miembro válido
                if (!targetGoodybeMember) return message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${locale.goodbye.invalidMember}.`)
                ]});
                
                //Emite el evento
                await client.emit('guildMemberRemove', targetGoodybeMember);

                //Envía un mensaje de confirmación
                await message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.secondaryCorrect)
                    .setDescription(`${client.customEmojis.greenTick} ${locale.goodbye.done}`)
                ]}).then(msg => {setTimeout(() => msg.delete(), 2000)});

                //Para la ejecución
                break;
        
            case 'assortStats': //Para encuadrar stats

                //Envía una confirmación de inicio a la consola
                console.log(`${new Date().toLocaleString()} 》${locale.assortStats.startingLog} ...\n\n`);

                //Envía una confirmación de inicio al canal
                await message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.information)
                    .setTitle(`${client.customEmojis.grayTick} ${locale.assortStats.startingEmbed.title}`)
                    .setDescription(locale.assortStats.startingEmbed.description)
                ]});

                //Almacena los IDs de cada miembro de las stats
                const IDs = Object.keys(client.db.stats);

                //Inicializa un contador
                let index = 0;

                //Crea un intervalo de ejecución de 1s
                let interval = setInterval(async function() {

                    //Busca el miembro por su ID
                    const member = await client.functions.fetchMember(message.guild, IDs[index]);

                    //Busca las estadísticas del miembro en la tabla de clasificación
                    const memberStats = client.db.stats[member.id];

                    //Si se escpecifica, se cambiará el nivel del miembro por el número indicado
                    if (args[1] && !isNaN(args[1]) && (memberStats && memberStats.level > args[1])) memberStats.level = args[1];

                    //Comprueba si existe el miembro y si tiene nivel
                    if (member && memberStats.level > 0) {

                        //Advierte por consola de que se omitirá al miembro en el caso de que su XP total sea menor o igual al umbral de su nivel
                        if (memberStats.totalXP <= (5 * client.config.xp.dificultyModifier) * Math.pow(memberStats.level, 3) + 50 * memberStats.level + 100) console.log(`${client.functions.localeParser(locale.assortStats.memberOmitted, { member: memberDisplayName.displayName })}\n- - - - - -`);

                        //Mientras que el XP del miembro sea superior o igual al umbral de su nivel
                        while (memberStats.totalXP >= (5 * client.config.xp.dificultyModifier) * Math.pow(memberStats.level, 3) + 50 * memberStats.level + 100) {

                            //Añade al miembro la cantidad de XP generada al cumplirse un intervalo de voz, einforma por consola
                            await client.functions.addXP(member, 'voice').then(console.log(`${client.functions.localeParser(locale.assortStats.memberUpdated, { member: memberDisplayName.displayName })}\n- - - - - -`));
                        };

                    } else {

                        //Advierte por consola, de que el miembro se ha omitido
                        console.log(`${client.functions.localeParser(locale.assortStats.userOmitted, { userId: IDs[index] })}\n- - - - - -`);IDs[index]
                    };
                    
                    //Incrementa el contador
                    index++;

                    //Si el contador equivale al total de IDs
                    if (index === IDs.length) {

                        //Finaliza el intervalo
                        clearInterval(interval);

                        //Envía una confirmación de finalización a la consola
                        console.log(`\n\n${new Date().toLocaleString()} 》${locale.assortStats.finishedLog}`);

                        //Envía una confirmación de finalización al canal
                        await message.channel.send({ embeds: [ new client.MessageEmbed()
                            .setColor(client.config.colors.secondaryCorrect)
                            .setTitle(`${client.customEmojis.greenTick} ${locale.assortStats.finishedEmbed.title}`)
                            .setDescription(locale.assortStats.finishedEmbed.description)
                        ]});
                    };
                }, 1000);

                //Para la ejecución
                break;
            
            default: //En caso de que no se haya proporcionado un comando existente

                //Envía un mensaje de error
                await message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${locale.invalidCommand}.`)
                ]});

                //Para la ejecución
                break;
        };
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'run',
    aliases: ['execute', 'exec']
};
