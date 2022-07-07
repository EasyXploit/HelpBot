exports.run = async (message, client, locale) => {

    //Aborta si no es un evento de la guild registrada
    if (message.guild && message.guild.id !== client.homeGuild.id) return;

    //Previene la ejecución si el mensaje fue enviado por un bot o por el sistema
    if (message.author.bot || message.type !== 'DEFAULT') return;

    //Comprueba si el contenido del mensaje estaba permitido
    const isPermitted = await client.functions.moderation.checkMessage.run(client, message);

    //Aborta si no se permitió el mensaje
    if (!isPermitted) return;

    //Aumenta la cantidad de XP del miembro (si procede)
    if (message.channel.type !== 'DM' && client.config.leveling.rewardMessages && !client.config.leveling.nonXPChannels.includes(message.channel.id)) await client.functions.leveling.addExperience.run(client, message.member, 'message', message.channel);
};
