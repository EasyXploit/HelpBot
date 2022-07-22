exports.run = async (client, interaction, commandConfig, locale) => {
    
    try {

        //En función del comando especificado
        switch (interaction.options._hoistedOptions[0].value) {
            
            case 'welcome': //Emite el evento "guildMemberAdd"
                
                //Devuelve un error si no se ha proporcionado un miembro
                if (!interaction.options._hoistedOptions[1]) return interaction.reply({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${locale.welcome.memberNotProvided}.`)
                ], ephemeral: true});

                //Busca el miembro en la guild
                const targetWelcomeMember = await client.functions.utilities.fetch.run(client, 'member', interaction.options._hoistedOptions[1].value);

                //Devuelve un error si no se ha proporcionado un miembro válido
                if (!targetWelcomeMember) return interaction.reply({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${locale.welcome.invalidMember}.`)
                ], ephemeral: true});
                
                //Emite el evento
                await client.emit('guildMemberAdd', targetWelcomeMember);

                //Envía un mensaje de confirmación
                await interaction.reply({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.secondaryCorrect)
                    .setDescription(`${client.customEmojis.greenTick} ${locale.welcome.done}`)
                ], ephemeral: true});

                //Para la ejecución
                break;
        
            case 'goodbye': //Emite el evento "guildMemberRemove"
                
                //Devuelve un error si no se ha proporcionado un miembro
                if (!interaction.options._hoistedOptions[1]) return interaction.reply({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${locale.goodbye.memberNotProvided}.`)
                ], ephemeral: true});

                //Busca el miembro en la guild
                const targetGoodybeMember = await client.functions.utilities.fetch.run(client, 'member', interaction.options._hoistedOptions[1].value);

                //Devuelve un error si no se ha proporcionado un miembro válido
                if (!targetGoodybeMember) return interaction.reply({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${locale.goodbye.invalidMember}.`)
                ], ephemeral: true});
                
                //Emite el evento
                await client.emit('guildMemberRemove', targetGoodybeMember);

                //Envía un mensaje de confirmación
                await interaction.reply({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.secondaryCorrect)
                    .setDescription(`${client.customEmojis.greenTick} ${locale.goodbye.done}`)
                ], ephemeral: true});

                //Para la ejecución
                break;
            
            default: //En caso de que no se haya proporcionado un comando existente

                //Envía un mensaje de error
                await interaction.reply({ embeds: [ new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setDescription(`${client.customEmojis.redTick} ${locale.invalidCommand}.`)
                ], ephemeral: true});

                //Para la ejecución
                break;
        };
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
                optionName: 'script',
                type: 'STRING',
                required: true
            },
            {
                optionName: 'parameters',
                type: 'STRING',
                required: false
            }
        ]
    }
};
