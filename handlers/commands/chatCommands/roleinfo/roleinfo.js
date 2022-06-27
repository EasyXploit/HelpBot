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
            .addField(`🏷 ${locale.resultEmbed.roleName}`, `${role.name}${role.unicodeEmoji ? ` ${role.unicodeEmoji}` : ''}`, true)
            .addField(`🆔 ${locale.resultEmbed.roleId}`, role.id, true)
            .addField(`👥 ${locale.resultEmbed.roleMembers}`, role.members.size.toString(), true)
            .addField(`🗣 ${locale.resultEmbed.mentionable}`, role.mentionable ? locale.resultEmbed.isMentionable : locale.resultEmbed.isntMntionable, true)
            .addField(`👁️‍ ${locale.resultEmbed.hoisted}`, role.hoist ? locale.resultEmbed.isHoisted : locale.resultEmbed.isntHoisted, true)
            .addField(`🎨 ${locale.resultEmbed.color}`, role.hexColor, true)
            .addField(`📝 ${locale.resultEmbed.creationDate}`, `<t:${Math.round(role.createdTimestamp / 1000)}>`, true)
            .addField(`🤖 ${locale.resultEmbed.integration}`, role.managed ? locale.resultEmbed.isIntegration : locale.resultEmbed.isntIntegration, true)
        ]});

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
                optionName: 'role',
                type: 'ROLE',
                required: true
            }
        ]
    }
};
