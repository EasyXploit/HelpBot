exports.run = async (client, interaction, commandConfig, locale) => {

    try {

        //Busca el rol en la guild
        const role = await client.functions.utilities.fetch.run(client, 'role', interaction.options._hoistedOptions[0].value);

        //Si el rol no existe, devuelve un error
        if (!role) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.secondaryError)
            .setDescription(`${client.customEmojis.redTick} ${await client.functions.utilities.parseLocale.run(locale.roleNotFound, { role: interaction.options._hoistedOptions[0].value })}.`)
        ], ephemeral: true});

        //Envía un embed con la información del rol
        await interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(role.hexColor)
            .setTitle(`🔖 ${locale.resultEmbed.title}`)
            .setDescription(await client.functions.utilities.parseLocale.run(locale.resultEmbed.description, { role: role }))
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
                optionName: 'role',
                type: 'ROLE',
                required: true
            }
        ]
    }
};
