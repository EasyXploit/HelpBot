export default async (interaction) => {
    
    try {

        // Stores the translations of the script
        const locale = client.locale.handlers.buttons.updateNotifications;

        // Stores the interaction member
        const member = await client.functions.utils.fetch('member', interaction.user.id);

        // Stores if the member can win XP
        let notAuthorized;

        // Stores the IDs that cannot gain XP
        const wontEarnXP = await client.functions.db.getConfig('leveling.wontEarnXP')

        // For each of the roles they can earn XP
        for (let index = 0; index < wontEarnXP.length; index++) {

            // Checks if the executing member has it
            if (member.roles.cache.has(wontEarnXP[index])) notAuthorized = true; break;
        };

        // If is not authorized to do so, returns an error message
        if (notAuthorized) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
            .setDescription(`${client.customEmojis.orangeTick} ${locale.cantGainXp}.`)
        ], ephemeral: true});

        // Stores the action to be performed by the button style
        const buttonAction = interaction.message.components[0].components[0].style === discord.ButtonStyle.Secondary ? false : true;

        // Stores the member's profile, or creates it
        let memberProfile = await client.functions.db.getData('profile', interaction.user.id) || await client.functions.db.genData('profile', { userId: interaction.user.id });

        // Stores member notification settings
        let memberSetting = memberProfile.notifications.private;

        // If the configuration was already applied
        if ((!buttonAction && !memberSetting) || (buttonAction && memberSetting)) {

            // Warns of this situation to the user
            interaction.user.send({ content: `${client.customEmojis.orangeTick} | ${locale.alreadyApplied}.` }).then(msg => { setTimeout(() => msg.delete(), 3000) });

        } else {

            // If not, modify the database with the changes
            memberSetting.notifications.private = buttonAction;
            await client.functions.db.setData('profile', interaction.user.id, memberProfile);
        };

        // Generates a new row for the buttons
        const buttonsRow = new discord.ActionRowBuilder().addComponents(

            // Generates the new button
            new discord.ButtonBuilder()
                .setLabel(buttonAction ? locale.newButon.disable : locale.newButon.enable)
                .setStyle(buttonAction ? discord.ButtonStyle.Secondary : discord.ButtonStyle.Success)
                .setCustomId('updateNotifications')
        );

        // Edits the interaction with the new button
        await interaction.update({ components: [buttonsRow] });

    } catch (error) {

        // Executes the error handler
        await client.functions.managers.interactionError(error, interaction);
    };
};
