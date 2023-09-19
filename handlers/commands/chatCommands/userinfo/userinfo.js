export async function run(interaction, commandConfig, locale) {

    try {

        // Looks for the member in the guild
        const member = await client.functions.utils.fetch('member', interaction.options._hoistedOptions[0] ? interaction.options._hoistedOptions[0].value : interaction.member.id);

        // Checks if a valid member has been provided
        if (!member) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.invalidMember}.`)
        ], ephemeral: true});

        // Checks, if applicable, that the member has permission to see the data of others
        if (interaction.member.id !== member.id) {

            // Variable to know if is authorized
            const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.canSeeAny});

            // If the execution was not allowed, sends an error message
            if (!authorized) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.cantSeeAny}.`)
            ], ephemeral: true});
        };

        // Checks the status available to the member
        let status = [];
        if (member.id === interaction.guild.ownerId) status.push(locale.memberType.owner);
        if (member.permissions.has('Administrator')) status.push(locale.memberType.Administrator);
        if (member.permissions.has('ManageMessages')) status.push(locale.memberType.moderator);
        if (status.length < 1) status.push(locale.memberType.regular);

        // Stores the current sanction, if applied
        const sanction = member.communicationDisabledUntilTimestamp && member.communicationDisabledUntilTimestamp > Date.now() ? `${locale.embed.timeoutedUntil}: <t:${Math.round(new Date(member.communicationDisabledUntilTimestamp) / 1000)}>` : locale.embed.noSanction;

        // Stores the member's profile
        const memberProfile = await client.functions.db.getData('profile', member.id);

        // Stores the member warnings
        const memberWarns = memberProfile ? memberProfile.moderationLog.warnsHistory : null;

        // Sends an embed with the command result
        await interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(member.displayHexColor)
            .setTitle(await client.functions.utils.parseLocale(locale.embed.title, { memberDisplayName: member.displayName }))
            .setDescription(await client.functions.utils.parseLocale(locale.embed.description, { memberTag: member.user.tag }))
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: `🆔 ${locale.embed.memberId}`, value: member.id, inline: true },
                { name: `📝 ${locale.embed.registerDate}`, value: `<t:${Math.round(member.user.createdTimestamp / 1000)}>`, inline: true },
                { name: `↙ ${locale.embed.joinDate}`, value: `<t:${Math.round(member.joinedTimestamp / 1000)}>`, inline: true },
                { name: `👑 ${locale.embed.status}`, value: status.join(', '), inline: true },
                { name: `💎 ${locale.embed.nitroBooster}`, value: member.premiumSince ? await client.functions.utils.parseLocale(locale.embed.isBooster, { time: `<t:${Math.round(member.premiumSinceTimestamp / 1000)}>` }) : locale.embed.isntBooster, inline: true },
                { name: `🎖 ${locale.embed.highestRole}`, value: member.roles.highest.name, inline: true },
                { name: `⚖ ${locale.embed.infractions}`, value: memberWarns ? (memberWarns.length).toString() : '0', inline: true },
                { name: `📓 ${locale.embed.verification}`, value: member.pending ? locale.embed.isntVerified : locale.embed.isVerified, inline: true },
                { name: `⚠️ ${locale.embed.actualSanction}`, value: sanction, inline: true }
            )
        ]});

    } catch (error) {

        // Executes the error handler
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
