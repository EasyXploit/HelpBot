exports.run = async (client, message, args, command, commandConfig) => {
    
    try {
        
        if (!args[0]) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Debes mencionar a un miembro o escribir su id`)]
        });

        //Esto comprueba si se ha mencionado a un miembro o se ha proporcionado su ID y no es un bot
        const member = await client.functions.fetchMember(message.guild, args[0]);
        if (!member) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Debes mencionar a un miembro o escribir su id`)]
        });
        if (member.user.bot) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Los bots no pueden ganar XP`)]
        });
        

        //Comprueba si los argumentos se han introducido adecuadamente
        if (!args[1] || args[1] !== 'set' && args[1] !== 'add' && args[1] !== 'addrandom' && args[1] !== 'remove' && args[1] !== 'clear') return await client.functions.syntaxHandler(message.channel, commandConfig);
        if (args[1] !== 'clear' && (!args[2] || isNaN(args[2]))) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar una cantidad válida`)]
        });

        //Almacena la tabla de clasificación del miembro, y si no existe la crea
        if (!client.db.stats[member.id]) {
            client.db.stats[member.id] = {
                totalXP: 0,
                actualXP: 0,
                level: 0,
                lastMessage: 0
            };
        };
        const memberStats = client.db.stats[member.id];

        //Comprueba si se le puede restar esa cantidad al miembro
        if (args[1] === 'remove' && memberStats.totalXP < args[2]) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Debes proporcionar una cantidad válida`)]
        });

        //Comprueba si se le puede quitar el XP al miembro
        if (args[1] === 'clear' && memberStats.totalXP == 0) return message.channel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} Este miembro no tiene XP`)]
        });  

        //Almacena el moderador
        let moderator = await client.functions.fetchMember(message.guild, message.author.id);
        
        //Se comprueba si puede añadir XP al miembro en función de la jerarquía de roles
        if (moderator.id !== message.guild.ownerId) {
            if (moderator.roles.highest.position <= member.roles.highest.position) {
    
                return message.channel.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} No puedes modificar el XP de un miembro con un rol igual o superior al tuyo`)]
                });
            };
        };
        
        //Se declaran variables para almacenar las cantidades de XP
        let oldValue, newValue, level, actualXP;
        oldValue = parseInt(memberStats.totalXP);
        level = parseInt(memberStats.level);
        actualXP = parseInt(memberStats.actualXP);

        //Ejecuta la operación indicada en función del argumento
        switch (args[1]) {
            case 'set':
                client.db.stats[member.id].totalXP = parseInt(args[2]);
                newValue = parseInt(args[2]);
                break;

            case 'add':
                client.db.stats[member.id].totalXP = oldValue + parseInt(args[2]);
                newValue = oldValue + parseInt(args[2]);
                break;

            case 'addrandom':

                //Almacena el XP a añadir
                let generatedXp = 0;

                //Genera XP aleatorio según el parámetro proporcinado
                for (max = args[2]; max != 0; max--) {
                    const randomXp = await client.functions.randomIntBetween(client.config.xp.minimumXpReward, client.config.xp.maximumXpReward);
                    generatedXp = generatedXp + randomXp;
                };

                //Almacena el nuevo XP
                client.db.stats[member.id].totalXP = oldValue + generatedXp;
                newValue = oldValue + generatedXp;
                break;

            case 'remove':
                client.db.stats[member.id].totalXP = oldValue - parseInt(args[2]);
                newValue = oldValue - parseInt(args[2]);
                break;

            case 'clear':
                client.db.stats[member.id].totalXP = 0;
                client.db.stats[member.id].actualXP = 0;
                newValue = 0;
                break;
        };

        if (newValue > oldValue) { //Cambia el nivel y el XP actual
            let xpCount = newValue;
            while (((5 * client.config.xp.dificultyModifier) * Math.pow(level, 3) + 50 * level + 100) <= newValue) {
                level++;

                //Calcula el XP necesario para pasar al siguiente nivel
                const xpToNextLevel = await client.functions.xpToLevel(level);

                if (xpCount >= xpToNextLevel) xpCount = xpCount - xpToNextLevel;
            }
            client.db.stats[member.id].actualXP = xpCount;
            
            if (level !== client.db.stats[member.id].level) {
                client.db.stats[member.id].level = level;
                await client.functions.assignRewards(member, level);
            };
        } else if (newValue < oldValue) {

            //Cambia el nivel
            for (let index = 0;; index++) {
                if (((5 * client.config.xp.dificultyModifier) * Math.pow(index, 3) + 50 * index + 100) > newValue) {
                    level = index;
                    if (level !== client.db.stats[member.id].level) {
                        client.db.stats[member.id].level = level;
                        await client.functions.assignRewards(member, level);
                    };
                    break;
                };
            };

            //Cambia el XP actual
            let levelXp = 0;
            if (level > 0) levelXp = (5 * client.config.xp.dificultyModifier) * Math.pow((level - 1), 3) + 50 * (level - 1) + 100;
            let xpCount = newValue - levelXp;
            client.db.stats[member.id].actualXP = xpCount;
        };

        //Escribe el resultado en el JSON
        client.fs.writeFile('./databases/stats.json', JSON.stringify(client.db.stats, null, 4), async err => {
            if (err) throw err;

            await client.functions.loggingManager('embed',  new client.MessageEmbed()
                .setColor(client.config.colors.logging)
                .setTitle('📑 Registro - [SISTEMA DE XP]')
                .setDescription(`Se ha modificado la cantidad de XP de **${member.user.tag}**.`)
                .addField('Fecha:', `<t:${Math.round(new Date() / 1000)}>`, true)
                .addField('Moderador:', message.author.tag, true)
                .addField('Miembro:', member.user.tag, true)
                .addField('Anterior valor', oldValue.toString(), true)
                .addField('Nuevo valor', newValue.toString(), true));

            await member.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.correct)
                .setAuthor({ name: '[XP MODIFICADO]', iconURL: message.guild.iconURL({ dynamic: true}) })
                .setDescription(`${member}, tu cantidad de XP ha sido modificada`)
                .addField('Moderador', message.author.tag, true)
                .addField('Anterior valor', oldValue.toString(), true)
                .addField('Nuevo valor', newValue.toString(), true)]
            });

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
    description: 'Modifica la cantidad de XP de un miembro.',
    aliases: ['modifyxp'],
    parameters: '<@miembro | id> <"set" | "add" | "addrandom" | "remove" | "clear"> <cantidad>'
};

