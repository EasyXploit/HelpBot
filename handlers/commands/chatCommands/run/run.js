export async function run(interaction, commandConfig, locale) {
    
    try {

        //En función del comando especificado
        switch (interaction.options._hoistedOptions[0].value) {
            
            case 'welcome': //Emite el evento "guildMemberAdd"
                
                //Devuelve un error si no se ha proporcionado un miembro
                if (!interaction.options._hoistedOptions[1]) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                    .setDescription(`${client.customEmojis.redTick} ${locale.welcome.memberNotProvided}.`)
                ], ephemeral: true});

                //Busca el miembro en la guild
                const targetWelcomeMember = await client.functions.utils.fetch('member', interaction.options._hoistedOptions[1].value);

                //Devuelve un error si no se ha proporcionado un miembro válido
                if (!targetWelcomeMember) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                    .setDescription(`${client.customEmojis.redTick} ${locale.welcome.invalidMember}.`)
                ], ephemeral: true});
                
                //Emite el evento
                await client.emit('guildMemberAdd', targetWelcomeMember);

                //Envía un mensaje de confirmación
                await interaction.reply({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.secondaryCorrect')}`)
                    .setDescription(`${client.customEmojis.greenTick} ${locale.welcome.done}`)
                ], ephemeral: true});

                //Para la ejecución
                break;
        
            case 'goodbye': //Emite el evento "guildMemberRemove"
                
                //Devuelve un error si no se ha proporcionado un miembro
                if (!interaction.options._hoistedOptions[1]) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                    .setDescription(`${client.customEmojis.redTick} ${locale.goodbye.memberNotProvided}.`)
                ], ephemeral: true});

                //Busca el miembro en la guild
                const targetGoodybeMember = await client.functions.utils.fetch('member', interaction.options._hoistedOptions[1].value);

                //Devuelve un error si no se ha proporcionado un miembro válido
                if (!targetGoodybeMember) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                    .setDescription(`${client.customEmojis.redTick} ${locale.goodbye.invalidMember}.`)
                ], ephemeral: true});
                
                //Emite el evento
                await client.emit('guildMemberRemove', targetGoodybeMember);

                //Envía un mensaje de confirmación
                await interaction.reply({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.secondaryCorrect')}`)
                    .setDescription(`${client.customEmojis.greenTick} ${locale.goodbye.done}`)
                ], ephemeral: true});

                //Para la ejecución
                break;
            
            default: //En caso de que no se haya proporcionado un comando existente

                //Envía un mensaje de error
                await interaction.reply({ embeds: [ new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                    .setDescription(`${client.customEmojis.redTick} ${locale.invalidCommand}.`)
                ], ephemeral: true});

                //Para la ejecución
                break;
        };
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError(error, interaction);
    };
};

export let config = {
    type: 'global',
    neededBotPermissions: {
        guild: [],
        channel: ['UseExternalEmojis']
    },
    defaultMemberPermissions: new discord.PermissionsBitField('Administrator'),
    dmPermission: false,
    appData: {
        type: discord.ApplicationCommandType.ChatInput,
        options: [
            {
                optionName: 'script',
                type: discord.ApplicationCommandOptionType.String,
                required: true
            },
            {
                optionName: 'parameters',
                type: discord.ApplicationCommandOptionType.String,
                required: false
            }
        ]
    }
};
