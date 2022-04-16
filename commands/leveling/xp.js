exports.run = async (client, message, args, command, commandConfig, locale) => {
    
    try {

        //Comprueba si la sintaxis introducida es correcta
        if (!args[0] || !args[1] || !['set', 'add', 'addrandom', 'remove', 'clear'].includes(args[1])) return await client.functions.syntaxHandler(message.channel, commandConfig);

        //Almacena el miembro proporcionado
        const member = await client.functions.fetchMember(message.guild, args[0]);

        //Comprueba si se ha proporcionado un miembro válido
        if (!member && !client.db.stats[args[0]]) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} No has proporcionado un miembro válido`)]
        });

        //Almacena el ID del miembro
        const memberId = member ? member.id : args[0];

        //Si el miembro era un bot
        if (member && member.user.bot) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Los bots no pueden ganar puntos de XP`)]
        });
        
        //Comprueba si los argumentos se han introducido adecuadamente
        if (args[1] !== 'clear' && (!args[2] || isNaN(args[2]))) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar una cantidad válida`)]
        });

        //Si el miembro no tiene estadísticas, se las crea
        if (!client.db.stats[memberId]) {
            client.db.stats[memberId] = {
                totalXP: 0,
                actualXP: 0,
                level: 0,
                lastMessage: 0
            };
        };

        //Almacena las estadísticas del miembro
        const memberStats = client.db.stats[memberId];

        //Comprueba si se le puede restar esa cantidad al miembro
        if (args[1] === 'remove' && memberStats.totalXP < args[2]) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar una cantidad válida`)]
        });

        //Comprueba si se le puede quitar el XP al miembro
        if (args[1] === 'clear' && memberStats.totalXP === 0) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Este miembro no tiene XP`)]
        });  
        
        //Si el ejecutor no es el dueño de la guild, o un botManager
        if (message.memberId !== message.guild.ownerId && !message.member.roles.cache.find(role => role.id === client.config.main.botManagerRole)) {

            //Si el rol del miembro es mayor o igual que el del ejecutor
            if (member && message.member.roles.highest.position <= member.roles.highest.position) {
    
                //Devuelve un mensaje de error
                return message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} No puedes modificar el XP de un miembro con un rol igual o superior al tuyo`)]
                });
            };
        };
        
        //Se declaran variables para almacenar las cantidades de XP (antiguas y nuevas) y el nivel modificado
        let oldValue = memberStats.totalXP, newValue = 0, newLevel = memberStats.level;

        //Ejecuta la operación indicada en función del argumento
        switch (args[1]) {

            //Si hay que fijar la cantidad de XP
            case 'set':

                //Almacena el nuevo XP
                memberStats.totalXP = parseInt(args[2]);

                //Almacena el nuevo valor de XP
                newValue = parseInt(args[2]);

                //Para el switch
                break;

            //Si hay que añadir XP a la cantidad actual
            case 'add':

                //Almacena el nuevo XP
                memberStats.totalXP = oldValue + parseInt(args[2]);

                //Almacena el nuevo valor de XP
                newValue = oldValue + parseInt(args[2]);

                //Para el switch
                break;

            //Si hay que añadir XP aleatorio a la cantidad actual
            case 'addrandom':

                //Almacena el XP a añadir
                let generatedXp = 0;

                //Según el parámetro proporcinado
                for (max = parseInt(args[2]); max != 0; max--) {

                    //Genera XP aleatorio y actualiza la variable del total
                    generatedXp += await client.functions.randomIntBetween(client.config.xp.minimumXpReward, client.config.xp.maximumXpReward);
                };

                //Almacena el nuevo XP
                memberStats.totalXP = oldValue + generatedXp;

                //Almacena el nuevo valor de XP
                newValue = oldValue + generatedXp;

                //Para el switch
                break;

            //Si hay que quitar XP a la cantidad actual
            case 'remove':

                //Almacena el nuevo XP
                memberStats.totalXP = oldValue - parseInt(args[2]);

                //Almacena el nuevo valor de XP
                newValue = oldValue - parseInt(args[2]);

                //Para el switch
                break;

            //Si hay que vaciar todo el XP
            case 'clear':

                //Actualiza el total de XP del miembro
                memberStats.totalXP = 0;

                //Actualiza el XP actual del miembro
                memberStats.actualXP = 0;

                //Para el switch
                break;
        };

        //Si el nuevo valor de XP es superior al antiguo
        if (newValue > oldValue) { 

            //Almacena el XP a incrementar
            let xpCount = newValue;

            //Almacena el XP necesario para pasar al siguiente nivel
            let xpToNextLevel = await client.functions.xpToLevel(newLevel + 1);

            //Mientras que el XP actual sea mayor o igual que el necesario para subir al siguiente nivel
            while (newValue >= xpToNextLevel) {
                
                //Incrementa el contador de nivel
                newLevel++;

                //Actualiza el XP necesario para subir de nivel
                xpToNextLevel = await client.functions.xpToLevel(newLevel + 1);

                //Mientras que el conteo de XP sea mayor o igual que el necesario para el siguiente nivel, le resta este último
                if (xpCount >= xpToNextLevel) xpCount -= xpToNextLevel;
            };

            //Actualiza el XP actual del miembro
            memberStats.actualXP = xpCount;

        } else if (newValue < oldValue) { //Si el nuevo valor de XP es inferior al antiguo

            //Inicia un bucle desde 0 al infinito
            for (let index = 0; ; index++) {

                //Por cada uno de los niveles, comprueba si el XP requerido supera el asignado al miembro
                if (await client.functions.xpToLevel(index + 1) > newValue) {

                    //Almacena el nuevo nivel del miembro
                    newLevel = index;

                    //Para el bucle
                    break;
                };
            };

            //Actualiza el XP actual, en función de si ha subido de nivel o no
            memberStats.actualXP = newLevel > 0 ? newValue - await client.functions.xpToLevel(newLevel + 1) : newValue;
        };

        //Si el nivel ha sido modificado
        if (newLevel !== memberStats.level) {

            //Graba el nuevo nivel del miembro
            memberStats.level = newLevel;

            //Asigna las recompensas del nivel al miembro (y elimina las que no le corresponde)
            await client.functions.assignRewards(member, newLevel, true);
        };

        //Sobreescribe el fichero de la base de datos con los cambios
        client.fs.writeFile('./databases/stats.json', JSON.stringify(client.db.stats, null, 4), async err => {

            //Si hubo un error, lo lanza a la consola
            if (err) throw err;

            //Envía un mensaje al canal de registros
            await client.functions.loggingManager('embed',  new client.MessageEmbed()
                .setColor(client.config.colors.logging)
                .setTitle('📑 Registro - [SISTEMA DE XP]')
                .setDescription(`Se ha modificado la cantidad de XP de **${member.user.tag}**.`)
                .addField('Fecha:', `<t:${Math.round(new Date() / 1000)}>`, true)
                .addField('Moderador:', message.author.tag, true)
                .addField('ID del miembro:', memberId.toString(), true)
                .addField('XP anterior', oldValue.toString(), true)
                .addField('Nuevo XP', newValue.toString(), true));

            //Envía una notificación al miembro
            await member.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.correct)
                .setAuthor({ name: '[XP MODIFICADO]', iconURL: message.guild.iconURL({ dynamic: true}) })
                .setDescription(`${member}, tu cantidad de XP ha sido modificada`)
                .addField('Moderador', message.author.tag, true)
                .addField('XP anterior', oldValue.toString(), true)
                .addField('Nuevo XP', newValue.toString(), true)
            ]});

            //Notifica la acción en el canal de invocación
            await message.channel.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryCorrect)
                .setDescription(`${client.customEmojis.greenTick} Se ha modificado la cantidad de XP del miembro **${member.user.tag}**.`)]
            });
        });
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'xp',
    aliases: ['modifyxp']
};

