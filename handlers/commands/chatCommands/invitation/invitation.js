export async function run(interaction, commandConfig, locale) {
    
    try {

        // Stores the invitation code in the database
        let inviteCode = await client.functions.db.getConfig('system.inviteCode');

        // Function to create an invitation on any available channel
        async function createInvite() {

            // Stores the channel to create the invitation
            let targetChannel;

            // Stores if permissions are missing in the rules channel
            const missingPermissionOnRulesChannel = await client.functions.utils.missingPermissions(client.baseGuild.rulesChannel, client.baseGuild.members.me, ['CreateInstantInvite'], true);
            
            // Checks if there are rules channel and if has permission to create the invitation
            if (client.baseGuild.rulesChannel && !missingPermissionOnRulesChannel) {

                // Stores the rules channel
                targetChannel = client.baseGuild.rulesChannel;

            } else {

                // Otherwise, it does the same with the first channel that allows it
                await client.baseGuild.channels.fetch().then(async channels => {

                    // Filters the channels so that only text ones are included
                    channels = await channels.filter(channel => channel.type === discord.ChannelType.GuildText);

                    // Map of the IDS of the channels
                    const channelIds = channels.map(channel => channel.id);

                    // Checks on each channel if can create the invitation
                    for (index = 0; index < channels.size; index++) {

                        // Gets the channel based on the ID from the list
                        const channel = channels.get(channelIds[index]);

                        // Stores if permissions are missing on the channel
                        const missingPermission = await client.functions.utils.missingPermissions(channel, client.baseGuild.members.me, ['CreateInstantInvite'], true);

                        // If has permissions, records the invitation
                        if(!missingPermission) return targetChannel = channel;
                    };
                });
            };

            // If a valid channel was not found
            if (!targetChannel) {

                // Shows an error to the user
                await interaction.reply({ embeds: [new discord.EmbedBuilder()
                    .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                    .setDescription(`${client.customEmojis.redTick} ${locale.noTargetChannel}`)
                ]});

                // Returns an erroneous state
                return false;
            };

            // Creates a permanent invitation on the channel
            await targetChannel.createInvite({maxAge: 0, reason: await client.functions.utils.parseLocale(locale.inviteReason, { botTag: client.user.tag })}).then(async invite => { inviteCode = invite.code; });

            // Records the invitation in the database
            await client.functions.db.setConfig('system.inviteCode', inviteCode);

            // Returns the invitation
            return inviteCode;
        };

        // If there is no invitation recorded in the database
        if (!inviteCode) {

            // Stores all guild invitations
            await client.baseGuild.invites.fetch().then(invites => {

                // For each of the invitations
                invites.forEach(async invite => {

                    // If it's from bot
                    if (invite.inviter === client.user) {

                        // Stores the invitation code
                        inviteCode = invite.code;

                        // Records the invitation in the database, if it was created
                        await client.functions.db.setConfig('system.inviteCode', inviteCode);
                    };
                });
            });

            // Creates the invitation if it does not exist
            if (!inviteCode) inviteCode = await createInvite();

        } else {

            // Looks for the existing invitation
            const existingInvite = await client.baseGuild.invites.resolve(inviteCode);

            // Creates the invitation if there is no longer
            if (!existingInvite) inviteCode = await createInvite();
        };

        // Abort the rest of the command if an invitation could not be generated
        if (!inviteCode) return 

        // Stores the invitation url
        const resultInviteURL = `https://discord.gg/${inviteCode}`;

        // Generates the embed and sends it, looking for the necessary content with the function
        await interaction.reply({ embeds: [new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.primary')}`)
            .setAuthor({ name: locale.resultEmbed.author, iconURL: client.baseGuild.iconURL({dynamic: true}) })
            .setDescription(resultInviteURL)
            .setFooter({ text: `${locale.resultEmbed.footer}.` })
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
        type: discord.ApplicationCommandType.ChatInput
    }
};
