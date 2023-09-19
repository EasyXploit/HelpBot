export async function run(interaction, commandConfig, locale) {

    try {

        // Looks for the role in the guild
        const role = await client.functions.utils.fetch('role', interaction.options._hoistedOptions[0].value);

        // If the role does not exist, returns an error
        if (!role) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.roleNotFound, { role: interaction.options._hoistedOptions[0].value })}.`)
        ], ephemeral: true});

        // Sends an embed with the information of the role
        await interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(role.hexColor)
            .setTitle(`🔖 ${locale.resultEmbed.title}`)
            .setDescription(await client.functions.utils.parseLocale(locale.resultEmbed.description, { role: role }))
            .setThumbnail(role.iconURL())
            .addFields(
                { name: `🏷 ${locale.resultEmbed.roleName}`, value: `${role.name}${role.unicodeEmoji ? ` ${role.unicodeEmoji}` : ''}`, inline: true },
                { name: `🆔 ${locale.resultEmbed.roleId}`, value: role.id, inline: true },
                { name: `👥 ${locale.resultEmbed.roleMembers}`, value: role.members.size.toString(), inline: true },
                { name: `🗣 ${locale.resultEmbed.mentionable}`, value: role.mentionable ? locale.resultEmbed.isMentionable : locale.resultEmbed.isntMntionable, inline: true },
                { name: `👁️‍ ${locale.resultEmbed.hoisted}`, value: role.hoist ? locale.resultEmbed.isHoisted : locale.resultEmbed.isntHoisted, inline: true },
                { name: `🎨 ${locale.resultEmbed.color}`, value: role.hexColor, inline: true },
                { name: `📝 ${locale.resultEmbed.creationDate}`, value: `<t:${Math.round(role.createdTimestamp / 1000)}>`, inline: true },
                { name: `🤖 ${locale.resultEmbed.integration}`, value: role.managed ? locale.resultEmbed.isIntegration : locale.resultEmbed.isntIntegration, inline: true }
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
    defaultMemberPermissions: new discord.PermissionsBitField('Administrator'),
    dmPermission: false,
    appData: {
        type: discord.ApplicationCommandType.ChatInput,
        options: [
            {
                optionName: 'role',
                type: discord.ApplicationCommandOptionType.Role,
                required: true
            }
        ]
    }
};
