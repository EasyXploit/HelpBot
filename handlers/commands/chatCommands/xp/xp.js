const { zip } = require("lodash");

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
                experience: 0,
                level: 0,
                lastMessage: 0,
                aproxVoiceTime: 0,
                messagesCount: 0,
                notifications: {
                    public: true,
                    private: true
                }
            };
        };

        //Almacena las estadísticas del miembro
        const memberStats = client.db.stats[memberId];

        //Comprueba si se le puede restar esa cantidad al miembro
        if (subcommand === locale.appData.options.remove.name && memberStats.experience < providedValue) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.invalidQuantity}.`)
        ], ephemeral: true});

        //Comprueba si se le puede quitar el XP al miembro
        if (subcommand === locale.appData.options.clear.name && memberStats.experience === 0) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${locale.hasNoXp}.`)
        ], ephemeral: true});

        //Almacena si se omite la comprobación de jerarquía
        const byPassed = await client.functions.utilities.checkAuthorization.run(client, interaction.member, { guildOwner: true, botManagers: true });

        //Si no se omitió y el rol del miembro es mayor o igual que el del ejecutor
        if (!byPassed && member && interaction.member.roles.highest.position <= member.roles.highest.position) {

            //Devuelve un mensaje de error
            return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.error)
                .setDescription(`${client.customEmojis.redTick} ${locale.unauthorizedModify}.`)
            ], ephemeral: true});
        };
        
        //Se declaran variables para almacenar las cantidades de XP (antiguas y nuevas) y el nivel modificado
        let oldValue = memberStats.experience, newValue = 0, newLevel = memberStats.level;

        //Ejecuta la operación indicada en función del argumento
        switch (subcommand) {

            //Si hay que fijar la cantidad de XP
            case locale.appData.options.set.name:

                //Almacena el nuevo XP
                memberStats.experience = parseInt(providedValue);

                //Almacena el nuevo valor de XP
                newValue = parseInt(providedValue);

                //Para el switch
                break;

            //Si hay que añadir XP a la cantidad actual
            case locale.appData.options.add.name:

                //Almacena el nuevo XP
                memberStats.experience = parseInt(oldValue) + parseInt(providedValue);

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
                    generatedXp += await client.functions.utilities.randomIntBetween.run(client.config.leveling.minimumXpReward, client.config.leveling.maximumXpReward);
                };

                //Almacena el nuevo XP
                memberStats.experience = parseInt(oldValue) + parseInt(generatedXp);

                //Almacena el nuevo valor de XP
                newValue = parseInt(oldValue) + parseInt(generatedXp);

                //Para el switch
                break;

            //Si hay que quitar XP a la cantidad actual
            case locale.appData.options.remove.name:

                //Almacena el nuevo XP
                memberStats.experience = parseInt(oldValue) - parseInt(providedValue);

                //Almacena el nuevo valor de XP
                newValue = parseInt(oldValue) - parseInt(providedValue);

                //Para el switch
                break;

            //Si hay que vaciar todo el XP
            case locale.appData.options.clear.name:

                //Actualiza el total de XP del miembro
                memberStats.experience = 0;

                //Para el switch
                break;
        };

        //Almacena el nivel correspondiente al XP especificado
        const neededExperience = await client.functions.leveling.getNeededExperience.run(client, newValue);

        //Almacena el nuevo nivel del miembro
        newLevel = neededExperience.nextLevel;

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
                .addFields(
                    { name: locale.loggingEmbed.date, value: `<t:${Math.round(new Date() / 1000)}>`, inline: true },
                    { name: locale.loggingEmbed.moderator, value: interaction.user.tag, inline: true },
                    { name: locale.loggingEmbed.memberId, value: memberId.toString(), inline: true },
                    { name: locale.loggingEmbed.oldValue, value: oldValue.toString(), inline: true },
                    { name: locale.loggingEmbed.newValue, value: newValue.toString(), inline: true }
                )
            );

            //Notifica la acción en el canal de invocación
            await interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryCorrect)
                .setDescription(`${client.customEmojis.greenTick} ${await client.functions.utilities.parseLocale.run(locale.notificationEmbed, { memberTag: member.user.tag })}.`)
            ], ephemeral: true});

            //Si se le han vaciado los puntos de EXP al miembro
            if (newValue === 0) {

                //Envía al miembro una notificación por mensaje privado
                await member.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.primary)
                    .setAuthor({ name: locale.privateEmbed.reset.author, iconURL: interaction.guild.iconURL({ dynamic: true}) })
                    .setDescription(`${await client.functions.utilities.parseLocale.run(locale.privateEmbed.reset.description, { moderatorTag: interaction.user.tag })}.`)
                ]});

            //Si se le han aumentado los puntos de EXP al miembro
            } else if (newValue > oldValue) {

                //Envía al miembro una notificación por mensaje privado
                await member.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.primary)
                    .setAuthor({ name: locale.privateEmbed.increased.author, iconURL: interaction.guild.iconURL({ dynamic: true}) })
                    .setDescription(`${await client.functions.utilities.parseLocale.run(locale.privateEmbed.increased.description, { moderatorTag: interaction.user.tag, givenExp: providedValue, newXP: newValue.toString() })}.`)
                ]});

            //Si se le han reducido los puntos de EXP al miembro
            } else if (newValue < oldValue) {

                //Envía al miembro una notificación por mensaje privado
                await member.send({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.primary)
                    .setAuthor({ name: locale.privateEmbed.decreased.author, iconURL: interaction.guild.iconURL({ dynamic: true}) })
                    .setDescription(`${await client.functions.utilities.parseLocale.run(locale.privateEmbed.decreased.description, { moderatorTag: interaction.user.tag, removedXP: providedValue, newXP: newValue.toString() })}.`)
                ]});
            };
        });
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError.run(client, error, interaction);
    };
};

module.exports.config = {
    type: 'global',
    defaultPermission: false,
    dmPermission: false,
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
