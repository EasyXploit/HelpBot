exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!run (comando) [parámetro/s]
    
    try {

        //Envía un mensaje de error si no se ha proporcionado un comando
        if (!args[0]) return message.channel.send({ embeds: [
            new discord.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setDescription(`${client.customEmojis.redTick} La sintaxis de este comando es \`${client.config.guild.prefix}template (plantilla)\``)
            ]
        });

        switch (args[0]) {
            case 'bienvenida':  //Emite el evento "guildMemberAdd"
                
                //Devuelve un error si no se ha proporcionado un miembro
                if (!args[1]) return message.channel.send({ embeds: [
                    new discord.MessageEmbed()
                        .setColor(client.config.colors.error)
                        .setDescription(`${client.customEmojis.redTick} No has proporcionado un miembro`)
                    ]
                });

                //Busca el miembro en la guild
                const targetWelcomeMember = await client.functions.fetchMember(message.guild, args[1]);

                //Devuelve un error si no se ha proporcionado un miembro válido
                if (!targetWelcomeMember) return message.channel.send({ embeds: [
                    new discord.MessageEmbed()
                        .setColor(client.config.colors.error)
                        .setDescription(`${client.customEmojis.redTick} No has proporcionado un miembro válido`)
                    ]
                });
                
                //Emite el evento
                await client.emit(`guildMemberAdd`, targetWelcomeMember);

                //Envía un mensaje de confirmación
                await message.channel.send({ embeds: [
                    new discord.MessageEmbed()
                        .setColor(client.config.colors.secondaryCorrect)
                        .setDescription(`${client.customEmojis.greenTick} ¡Listo!`)
                    ]
                }).then(msg => {setTimeout(() => msg.delete(), 2000)});
                break;
        
            case 'despedida':   //Emite el evento "guildMemberRemove"
                
                //Devuelve un error si no se ha proporcionado un miembro
                if (!args[1]) return message.channel.send({ embeds: [
                    new discord.MessageEmbed()
                        .setColor(client.config.colors.error)
                        .setDescription(`${client.customEmojis.redTick} No has proporcionado un miembro`)
                    ]
                });

                //Busca el miembro en la guild
                const targetGoodybeMember = await client.functions.fetchMember(message.guild, args[1]);

                //Devuelve un error si no se ha proporcionado un miembro válido
                if (!targetGoodybeMember) return message.channel.send({ embeds: [
                    new discord.MessageEmbed()
                        .setColor(client.config.colors.error)
                        .setDescription(`${client.customEmojis.redTick} No has proporcionado un miembro válido`)
                    ]
                });
                
                //Emite el evento
                await client.emit(`guildMemberRemove`, targetGoodybeMember);

                //Envía un mensaje de confirmación
                await message.channel.send({ embeds: [
                    new discord.MessageEmbed()
                        .setColor(client.config.colors.secondaryCorrect)
                        .setDescription(`${client.customEmojis.greenTick} ¡Listo!`)
                    ]
                }).then(msg => {setTimeout(() => msg.delete(), 2000)});
                break;
        
            case 'cuadrarStats':

                /*
                    //OBJETIVO:
                    Mediante la adición de la XP que se genera al cumplir un intervalo de XP por voz,
                    esta función fuerza al sistema a disparar la actualización de los roles de los
                    miembros a los que les corresponda subir de nivel.

                    Esto es util en el caso de que se hayan añadido nuevos roles de recompensa
                    intercalados entre los roles de recompensa actuales.

                    //ACTUALIZACIÓN DE NIVEL:
                    Si además se proporciona un parámetro numérico adicional, el programa entenderá
                    que debe actualizar el nivel de los miembros al número proporcionado, en caso de
                    que su nivel sea superior.
                */

                //Envía una confirmación de inicio a la consola
                console.log(`${new Date().toLocaleString()} 》Comenzando operación de cuadre de stats ...\n\n`);

                //Envía una confirmación de inicio al canal
                await message.channel.send({ embeds: [
                    new discord.MessageEmbed()
                        .setColor(client.config.colors.information)
                        .setTitle(`${client.customEmojis.grayTick} Cuadrando stats`)
                        .setDescription('Comenzando operación de cuadre de la tabla de clasificación.\nRevisa la consola para evaluar el progreso del comando.')
                    ]
                });

                //Almacena la tabla de clasificación de la guild
                const guildStats = client.stats[message.guild.id];
                const IDs = Object.keys(guildStats);    //Almacena los IDs de cada miembro

                //Inicializa un contador
                let index = 0;

                //Crea un intervalo de ejecución de 1s
                let interval = setInterval(async function() {

                    //Busca el miembro por su ID
                    let member = await client.functions.fetchMember(message.guild, IDs[index]);

                    //Busca las estadísticas del miembro en la tabla de clasificación
                    let userStats = guildStats[member.id];

                    //Si se escpecifica, se cambiará el nivel del miembro por el número indicado
                    if (args[1] && !isNaN(args[1]) && (userStats && userStats.level > args[1])) userStats.level = args[1];

                    //Comprueba si existe el miembro y si tiene nivel
                    if (member && userStats.level > 0) {

                        //Advierte por consola de que se omitirá al miembro en el caso de que su XP total sea menor o igual al umbral de su nivel
                        if (userStats.totalXP <= 5 * Math.pow(userStats.level, 3) + 50 * userStats.level + 100) console.log(`Miembro ${member.displayName} omitido\n- - - - - -`);

                        //Mientras que el XP del miembro sea superior o igual al umbral de su nivel
                        while (userStats.totalXP >= 5 * Math.pow(userStats.level, 3) + 50 * userStats.level + 100) {

                            //Añade al miembro la cantidad de XP generada al cumplirse un intervalo de voz, einforma por consola
                            await client.functions.addXP(member, message.guild, 'voice').then(console.log(`Miembro ${member.displayName} actualizado\n- - - - - -`));
                        };
                    } else {

                        //Advierte por consola, de que el miembro se ha omitido
                        console.log(`Usuario ${IDs[index]} omitido\n- - - - - -`);
                    };
                    
                    //Incrementa el contador
                    index++;

                    //Si el contador equivale al total de IDs
                    if (index === IDs.length) {

                        //Finaliza el intervalo
                        clearInterval(interval);

                        //Envía una confirmación de finalización a la consola
                        console.log(`\n\n${new Date().toLocaleString()} 》Operación finalizada`);

                        //Envía una confirmación de finalización al canal
                        await message.channel.send({ embeds: [
                            new discord.MessageEmbed()
                                .setColor(client.config.colors.secondaryCorrect)
                                .setTitle(`${client.customEmojis.greenTick} Stats encuadradas`)
                                .setDescription('La operación de encuadre de estadísticas ha finalizado.\nPor favor, realice una revisión manual para confirmar su efectividad.')
                            ]
                        });
                    };
                }, 1000);
                break;
            
            default:

                //Envía un mensaje de error si no se ha proporcionado un comando válido
                await message.channel.send({ embeds: [
                    new discord.MessageEmbed()
                        .setColor(client.config.colors.error)
                        .setDescription(`${client.customEmojis.redTick} No has especificado una plantilla válida`)
                    ]
                });
                break;
        };
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'run',
    aliases: ['execute', 'exec']
};
