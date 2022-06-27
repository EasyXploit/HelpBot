exports.run = async (client, interaction, commandConfig, locale) => {
    
    try {

        //Almacena el subcomando elegido
        const subcommand = interaction.options._subcommand;

        //Almacena el miembro proporcionado
        const member = await client.functions.utilities.fetch.run(client, 'member', interaction.options._hoistedOptions[0].value);

        //Comprueba si se ha proporcionado un miembro válido
        if (!member && !client.db.stats[interaction.options._hoistedOptions[0].value]) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.invalidMember}.`)
        ], ephemeral: true});

        //Almacena el ID del miembro
        const memberId = member ? member.id : interaction.options._hoistedOptions[1].value;

        //Si el miembro era un bot
        if (member && member.user.bot) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.noBots}.`)
        ], ephemeral: true});

        //Almacena el valor para su modificación
        const providedValue = interaction.options._hoistedOptions[1] ? interaction.options._hoistedOptions[1].value : null;

        //Si el miembro no tiene estadísticas, se las crea
        if (!client.db.stats[memberId]) {
            client.db.stats[memberId] = {
                totalXP: 0,
                actualXP: 0,
                level: 0,
                lastMessage: 0,
                aproxVoiceTime: 0,
                notifications: {
                    public: true,
                    private: true
                }
            };
        };

        //Almacena las estadísticas del miembro
        const memberStats = client.db.stats[memberId];

        //Comprueba si se le puede restar esa cantidad al miembro
        if (subcommand === locale.appData.options.remove.name && memberStats.totalXP < providedValue) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.invalidQuantity}.`)
        ], ephemeral: true});

        //Comprueba si se le puede quitar el XP al miembro
        if (subcommand === locale.appData.options.clear.name && memberStats.totalXP === 0) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.hasNoXp}.`)
        ], ephemeral: true});  
        
        //Si el ejecutor no es el dueño de la guild, o un botManager
        if (interaction.member.id !== interaction.guild.ownerId && !interaction.member.roles.cache.find(role => role.id === client.config.main.botManagerRole)) {

            //Si el rol del miembro es mayor o igual que el del ejecutor
            if (member && interaction.member.roles.highest.position <= member.roles.highest.position) {
    
                //Devuelve un mensaje de error
                return interaction.reply({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${locale.unauthorizedModify}.`)
                ], ephemeral: true});
            };
        };
        
        //Se declaran variables para almacenar las cantidades de XP (antiguas y nuevas) y el nivel modificado
        let oldValue = memberStats.totalXP, newValue = 0, newLevel = memberStats.level;

        //Ejecuta la operación indicada en función del argumento
        switch (subcommand) {

            //Si hay que fijar la cantidad de XP
            case locale.appData.options.set.name:

                //Almacena el nuevo XP
                memberStats.totalXP = parseInt(providedValue);

                //Almacena el nuevo valor de XP
                newValue = parseInt(providedValue);

                //Para el switch
                break;

            //Si hay que añadir XP a la cantidad actual
            case locale.appData.options.add.name:

                //Almacena el nuevo XP
                memberStats.totalXP = parseInt(oldValue) + parseInt(providedValue);

                //Almacena el nuevo valor de XP
                newValue = parseInt(oldValue) + parseInt(providedValue);

                //Para el switch
                break;

            //Si hay que añadir XP aleatorio a la cantidad actual
            case locale.appData.options.addrandom.name:

                //Almacena el XP a añadir
                let generatedXp = 0;

                //Según el parámetro proporcinado
                for (max = providedValue; max != 0; max--) {

                    //Genera XP aleatorio y actualiza la variable del total
                    generatedXp += await client.functions.utilities.randomIntBetween.run(client.config.xp.minimumXpReward, client.config.xp.maximumXpReward);
                };

                //Almacena el nuevo XP
                memberStats.totalXP = parseInt(oldValue) + parseInt(generatedXp);

                //Almacena el nuevo valor de XP
                newValue = parseInt(oldValue) + parseInt(generatedXp);

                //Para el switch
                break;

            //Si hay que quitar XP a la cantidad actual
            case locale.appData.options.remove.name:

                //Almacena el nuevo XP
                memberStats.totalXP = parseInt(oldValue) - parseInt(providedValue);

                //Almacena el nuevo valor de XP
                newValue = parseInt(oldValue) - parseInt(providedValue);

                //Para el switch
                break;

            //Si hay que vaciar todo el XP
            case locale.appData.options.clear.name:

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
            let xpCount = parseInt(newValue);

            //Almacena el XP necesario para pasar al siguiente nivel
            let xpToNextLevel = await client.functions.leveling.getXpToLevel.run(client, newLevel + 1);

            //Mientras que el XP actual sea mayor o igual que el necesario para subir al siguiente nivel
            while (newValue >= xpToNextLevel) {
                
                //Incrementa el contador de nivel
                newLevel++;

                //Actualiza el XP necesario para subir de nivel
                xpToNextLevel = await client.functions.leveling.getXpToLevel.run(client, newLevel + 1);

                //Mientras que el conteo de XP sea mayor o igual que el necesario para el siguiente nivel, le resta este último
                if (xpCount >= xpToNextLevel) xpCount -= xpToNextLevel;
            };

            //Actualiza el XP actual del miembro
            memberStats.actualXP = xpCount;

        } else if (newValue < oldValue) { //Si el nuevo valor de XP es inferior al antiguo

            //Inicia un bucle desde 0 al infinito
            for (let index = 0; ; index++) {

                //Por cada uno de los niveles, comprueba si el XP requerido supera el asignado al miembro
                if (await client.functions.leveling.getXpToLevel.run(client, index + 1) > newValue) {

                    //Almacena el nuevo nivel del miembro
                    newLevel = index;

                    //Para el bucle
                    break;
                };
            };

            //Actualiza el XP actual, en función de si ha subido de nivel o no
            memberStats.actualXP = newLevel > 0 ? newValue - await client.functions.leveling.getXpToLevel.run(client, newLevel + 1) : newValue;
        };

        //Si el nivel ha sido modificado
        if (newLevel !== memberStats.level) {

            //Graba el nuevo nivel del miembro
            memberStats.level = newLevel;

            //Asigna las recompensas del nivel al miembro (y elimina las que no le corresponde)
            await client.functions.leveling.assignRewards.run(client, member, newLevel, true);
        };

        //Sobreescribe el fichero de la base de datos con los cambios
        client.fs.writeFile('./storage/databases/stats.json', JSON.stringify(client.db.stats, null, 4), async err => {

            //Si hubo un error, lo lanza a la consola
            if (err) throw err;

            //Envía un mensaje al canal de registros
            if (client.config.logging.experienceModified) await client.functions.managers.logging.run(client, 'embed',  new client.MessageEmbed()
                .setColor(client.config.colors.logging)
                .setTitle(`📑 ${locale.loggingEmbed.title}`)
                .setDescription(`${await client.functions.utilities.parseLocale.run(locale.loggingEmbed.description, { memberTag: member.user.tag })}.`)
                .addField(locale.loggingEmbed.date, `<t:${Math.round(new Date() / 1000)}>`, true)
                .addField(locale.loggingEmbed.moderator, interaction.user.tag, true)
                .addField(locale.loggingEmbed.memberId, memberId.toString(), true)
                .addField(locale.loggingEmbed.oldValue, oldValue.toString(), true)
                .addField(locale.loggingEmbed.newValue, newValue.toString(), true));

            //Notifica la acción en el canal de invocación
            await interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryCorrect)
                .setDescription(`${client.customEmojis.greenTick} ${await client.functions.utilities.parseLocale.run(locale.notificationEmbed, { memberTag: member.user.tag })}.`)
            ]});

            //Envía una notificación al miembro
            await member.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.correct)
                .setAuthor({ name: locale.privateEmbed.author, iconURL: interaction.guild.iconURL({ dynamic: true}) })
                .setDescription(`${await client.functions.utilities.parseLocale.run(locale.privateEmbed.description, { member: member })}.`)
                .addField(locale.privateEmbed.moderator, interaction.user.tag, true)
                .addField(locale.privateEmbed.oldValue, oldValue.toString(), true)
                .addField(locale.privateEmbed.newValue, newValue.toString(), true)
            ]});
        });
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError.run(client, error, interaction);
    };
};

module.exports.config = {
    type: 'guild',
    defaultPermission: false,
    appData: {
        type: 'CHAT_INPUT',
        options: [
            {
                optionName: 'set',
                type: 'SUB_COMMAND',
                options: [
                    {
                        optionName: 'user',
                        type: 'USER',
                        required: true
                    },
                    {
                        optionName: 'quantity',
                        type: 'INTEGER',
                        required: true
                    }
                ]
            },
            {
                optionName: 'add',
                type: 'SUB_COMMAND',
                options: [
                    {
                        optionName: 'user',
                        type: 'USER',
                        required: true
                    },
                    {
                        optionName: 'quantity',
                        type: 'INTEGER',
                        required: true
                    }
                ]
            },
            {
                optionName: 'addrandom',
                type: 'SUB_COMMAND',
                options: [
                    {
                        optionName: 'user',
                        type: 'USER',
                        required: true
                    },
                    {
                        optionName: 'times',
                        type: 'INTEGER',
                        required: true
                    }
                ]
            },
            {
                optionName: 'remove',
                type: 'SUB_COMMAND',
                options: [
                    {
                        optionName: 'user',
                        type: 'USER',
                        required: true
                    },
                    {
                        optionName: 'quantity',
                        type: 'INTEGER',
                        required: true
                    }
                ]
            },
            {
                optionName: 'clear',
                type: 'SUB_COMMAND',
                options: [
                    {
                        optionName: 'user',
                        type: 'USER',
                        required: true
                    }
                ]
            }
        ]
    }
};
