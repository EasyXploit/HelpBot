// Exports the event management function
export default async (oldMessage, newMessage, locale) => {

    // Checks if the bot is ready to handle events
    if (!global.readyStatus) return;

    // Aborts if it is not an event from the base guild
    if (newMessage.guild && newMessage.guild.id !== client.baseGuild.id) return;

    // Prevents execution if the message was sent by a bot or the system
    if (!newMessage.author || newMessage.author.bot || ![discord.MessageType.Default, discord.MessageType.Reply].includes(newMessage.type)) return;

    // Aborts if the content of the message was not modified
    if(oldMessage.content === newMessage.content) return;

    // Stores the moderation module status
    const moderationModuleEnabled = await client.functions.db.getConfig('system.modules.moderation');

    // Stores whether automod is enabled (which requires the moderation module to be active)
    const automodEnabled = moderationModuleEnabled && await client.functions.db.getConfig('moderation.automodEnabled');

    // Checks if the content of the message was allowed, if automod is enabled
    if (automodEnabled) await client.functions.moderation.checkMessage(newMessage);
};
