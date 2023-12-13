exports.run = async (oldMessage, newMessage, locale) => {

    //Aborta si no es un evento de la guild registrada
    if (newMessage.guild && newMessage.guild.id !== client.homeGuild.id) return;

    //Previene la ejecución si el mensaje fue enviado por un bot o por el sistema
    if (!newMessage.author || newMessage.author.bot || newMessage.type !== 'DEFAULT') return;

    //Aborta si no se modificó el contenido del mensaje
    if(oldMessage.content === newMessage.content) return;

    //Si el miembro no tiene entrada en el objeto de mensajes de miembros, la crea
    if (!client.userMessages[newMessage.author.id]) client.userMessages[newMessage.author.id] = {
        history: [],
        lastValidTimestamp: 0
    };

    //Comprueba si el contenido del mensaje estaba permitido
    await client.functions.moderation.checkMessage.run(newMessage);
};
