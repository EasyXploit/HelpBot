export async function run(interaction, commandConfig, locale) {

    try {

        //Busca el miembro en cuestión
        const member = interaction.options._hoistedOptions[0] ? await client.functions.utils.fetch('member', interaction.options._hoistedOptions[0].value): await client.functions.utils.fetch('member', interaction.member.id);

        //Almacena el ID del miembro
        const memberId = member ? member.id : interaction.options._hoistedOptions[0].value;

        //Comprueba, si corresponde, que el miembro tenga permiso para ver el historial de otros
        if (interaction.member.id !== memberId) {

            //Variable para saber si está autorizado
            const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.canSeeAny});

            //Si no se permitió la ejecución, manda un mensaje de error
            if (!authorized) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.nonPrivileged, { interactionAuthor: interaction.member })}.`)
            ], ephemeral: true});
        };

        //Comprueba si se trata de un bot
        if (member && member.user.bot) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.noBots}.`)
        ], ephemeral: true});

        //Almacena la página actual
        let actualPage = 1, totalPages = 1;

        //Almacena el total de sanciones, en 1 día y 1 semana, y las páginas totales
        let onDay = 0, onWeek = 0, total = 0;

        //Almacena el perfil del miembro, o lo crea
        let memberProfile = await client.functions.db.getData('profile', memberId);

        //Si el miembro no está en el servidor y no tiene perfil, devuelve un error
        if (!memberProfile && !member) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.memberNotFound}.`)
        ], ephemeral: true});

        //Crea el perfil del miembro si no lo tiene
        if (!memberProfile) memberProfile = await client.functions.db.genData('profile', { userId: memberId });

        //Almacena las advertencias del miembro
        let memberWarns = memberProfile.moderationLog.warnsHistory;

        //Invierte el orden de aparición de las advertencias
        memberWarns = memberWarns.reverse();

        //Almacena el total de ellas
        total = memberWarns.length;

        //Almacena el total de páginas
        totalPages = Math.ceil(memberWarns.length / 10);

        //Por cada advertencia del miembro
        for (const warn of memberWarns) {

            //Si ocurrió en un día o menos, lo contabiliza
            if ((Date.now() - warn.timestamp) <= 86400000) onDay++;

            //Si ocurrió en una semana o menos, lo contabiliza
            if ((Date.now() - warn.timestamp) <= 604800000) onWeek++;
        };

        //Almacena la última interacción del comando
        let latestInteraction;
        
        do {

            //Almacena el primer índice del rango de páginas
            const fromRange = 10 * actualPage - 9;

            //Almacena el último índice del rango de páginas
            const toRange = 10 * actualPage;

            //Almacena la lista de advertencias
            let board = '';

            //Por cada una de los índices del rango
            if (memberWarns) for (let index = fromRange - 1; index < toRange; index++) {

                //Si no hay más advertencias, para el bucle
                if (!memberWarns[index]) break;

                //Almacena las claves de la advertencia
                const warn = memberWarns[index];

                //Busca y almacena el moderador que aplicó la sanción
                const moderator = warn.executor.type === 'system' ? locale.warnSystemExecutor : await client.functions.utils.fetch('member', warn.executor.memberId) || locale.unknownModerator;

                //Añade una nueva fila con los detalles de la advertencia
                board += `\`${warn.warnId}\` • ${moderator} • <t:${Math.round(new Date(parseInt(warn.timestamp)) / 1000)}>\n${warn.reason}\n\n`;
            };

            //Almacena la sanción actual, si aplica
            const sanction = member && member.communicationDisabledUntilTimestamp && member.communicationDisabledUntilTimestamp > Date.now() ? `${locale.timeoutedUntil}: <t:${Math.round(new Date(member.communicationDisabledUntilTimestamp) / 1000)}>` : `\`${locale.noTimeout}\``;

            //Genera el embed de las infracciones
            let newPageEmbed = new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.primary')}`)
                .setTitle(`⚠ ${locale.infractionsEmbed.title}`)
                .setDescription(`${await client.functions.utils.parseLocale(locale.infractionsEmbed.description, { member: member ? member.user.tag : `${memberId} (ID)`, sanction: sanction })}.`)
                .addFields(
                    { name: locale.infractionsEmbed.last24h, value: onDay.toString(), inline: true },
                    { name: locale.infractionsEmbed.last7d, value: onWeek.toString(), inline: true },
                    { name: locale.infractionsEmbed.total, value: total.toString(), inline: true },
                    { name: locale.infractionsEmbed.list, value: total > 0 ? board : locale.infractionsEmbed.noList, inline: false }
                )
                .setFooter({ text: await client.functions.utils.parseLocale(locale.infractionsEmbed.page, { actualPage: actualPage, totalPages: totalPages > 0 ? totalPages : 1 }), iconURL: client.baseGuild.iconURL({dynamic: true}) });

            //Si se encontró el miembro, muestra su avatar en el embed
            if (member) newPageEmbed.setThumbnail(member.user.displayAvatarURL());

            //Invoca el gestor de navegación mediante botones
            const buttonNavigationResult = await client.functions.managers.buttonNavigation(interaction, 'infractions', actualPage, totalPages, newPageEmbed, latestInteraction, null);

            //Almacena la última interacción
            latestInteraction = buttonNavigationResult.latestInteraction;

            //Almacena la nueva página actual
            actualPage = buttonNavigationResult.newActualPage;

        //Mientras no se deba abortar por inactividad, continuará el bucle
        } while (actualPage !== false);

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
    defaultMemberPermissions: null,
    dmPermission: false,
    appData: {
        type: discord.ApplicationCommandType.ChatInput,
        options: [
            {
                optionName: 'user',
                type: discord.ApplicationCommandOptionType.User,
                required: false
            }
        ]
    }
};
