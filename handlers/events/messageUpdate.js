//Exporta la función de manejo del evento
export default async (oldMessage, newMessage, locale) => {

    //Comprueba si el bot está listo para manejar eventos
    if (!global.readyStatus) return;

    //Aborta si no es un evento de la guild registrada
    if (newMessage.guild && newMessage.guild.id !== client.baseGuild.id) return;

    //Previene la ejecución si el mensaje fue enviado por un bot o por el sistema
    if (newMessage.author.bot || newMessage.type !== discord.MessageType.Default) return;

    //Aborta si no se modificó el contenido del mensaje
    if(oldMessage.content === newMessage.content) return;

    //Comprueba si el contenido del mensaje estaba permitido
    await client.functions.moderation.checkMessage(newMessage);
};
