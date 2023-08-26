export async function run(interaction, commandConfig, locale) {
    
    try {

        //Almacena el ID del canal proporcionado, o el del actual
        const channelId = interaction.options._hoistedOptions[1] ? interaction.options._hoistedOptions[1].value : interaction.channelId;
        const channel = await client.functions.utils.fetch('channel', channelId);

        //Comprueba si el canal existe
        if (!channel || !['GUILD_TEXT', 'GUILD_NEWS', 'GUILD_STORE', 'GUILD_NEWS_THREAD', 'GUILD_PUBLIC_THREAD', 'GUILD_PRIVATE_THREAD'].includes(channel.type)) return interaction.reply({ embeds: [ new discord.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.invalidChannel}.`)
        ], ephemeral: true});

        //Comprueba si el miembro tiene permisos para ejecutar esta acción
        const missingPermissions = await client.functions.utils.missingPermissions(channel, interaction.member, ['MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'])
        if (missingPermissions) return interaction.reply({ embeds: [ new discord.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.noPermission, { channel: channel, missingPermissions: missingPermissions })}.`)
        ], ephemeral: true});

        //Se obtiene la cantidad de mensajes especificada (incluyendo el de invocación)
        const messages = await channel.messages.fetch({limit: parseInt(interaction.options._hoistedOptions[0].value)});

        //Si no se encontraron mensajes en el canal, devuelve un error
        if (messages.size === 0) return interaction.reply({ embeds: [ new discord.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.noMessages, { channel: channel })}.`)
        ], ephemeral: true});

        //Almacena los mensajes que serán borrados
        const msgsToDelete = new discord.Collection();

        //Por cada uno de los mensajes obtenidos
        await messages.forEach(msg => {

            //Lo añade al array "msgsToDelete" si tienen una edad menor a 2 semanas 
            if (Date.now() - msg.createdTimestamp  < 1209600000) msgsToDelete.set(msg.id, msg);
        });

        //Si ningún mensaje era lo suficientemente reciente, devuelve un error
        if (msgsToDelete.size === 0) return interaction.reply({ embeds: [ new discord.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.expiredMessages}.`)
        ], ephemeral: true});

        //Purga los mensajes del canal seleccionado
        await channel.bulkDelete(msgsToDelete);

        //Almacena la descripción del embed de confirmación
        successEmbedDescription = `${locale.successEmbed.description}: \`${msgsToDelete.size}\``;

        //Almacena el mensaje de confirmación
        let successEmbed = new discord.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryCorrect')}`)
            .setTitle(`${client.customEmojis.greenTick} ${locale.successEmbed.title}`)
            .setDescription(successEmbedDescription);

        //Si se omitieron mensajes, se indica en el footer del embed
        if (msgsToDelete.size < messages.size) successEmbed.setFooter({  text: `${await client.functions.utils.parseLocale(locale.successEmbed.footer, { omittedCount: messages.size - msgsToDelete.size })}.` });

        //Si el canal de la purga es el mismo que el de invocación, avisa de la eliminación de la confirmación
        if (channel.id === interaction.channelId) successEmbed.setDescription(`${successEmbedDescription}\n${await client.functions.utils.parseLocale(locale.successEmbed.willBeDeleted, { inSeconds: `<t:${Math.round(new Date(parseInt(Date.now() + 5000)) / 1000)}:R>` })}`)

        //Envía un mensaje de confirmación
        await interaction.reply({ embeds: [successEmbed] })
        
        //Si el canal de la purga es el mismo que el de invocación, elimina la confirmación a los 5 segundos
        if (channel.id === interaction.channelId) setTimeout(() => interaction.deleteReply(), 5000);

        //Envía un registro al canal de registro
        await client.functions.managers.sendLog('purgedChannel', 'embed', new discord.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.logging')}`)
            .setTitle(`📑 ${locale.loggingEmbed.title}`)
            .setDescription(await client.functions.utils.parseLocale(locale.loggingEmbed.description, { authorTag: interaction.user.tag, deletedCount: msgsToDelete.size, channel: channel }))
        );

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError(error, interaction);
    };
};

//"<cantidad> [#canal | id]"

export let config = {
    type: 'global',
    neededBotPermissions: {
        guild: [],
        channel: ['USE_EXTERNAL_EMOJIS']
    },
    defaultMemberPermissions: new discord.Permissions('ADMINISTRATOR'),
    dmPermission: false,
    appData: {
        type: 'CHAT_INPUT',
        options: [
            {
                optionName: 'quantity',
                type: 'INTEGER',
                required: true,
                minValue: 1,
                maxValue: 99
            },
            {
                optionName: 'channel',
                type: 'CHANNEL',
                required: false
            }
        ]
    }
};
