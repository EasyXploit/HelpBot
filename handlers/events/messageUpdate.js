exports.run = async (oldMessage, newMessage, client, locale) => {

    //Aborta si no es un evento de la guild registrada
    if (newMessage.guild && newMessage.guild.id !== client.homeGuild.id) return;

    //Previene la ejecución si el mensaje fue enviado por un bot o por el sistema
    if (newMessage.author.bot || newMessage.type !== 'DEFAULT') return;

    //Aborta si no se modificó el contenido del mensaje
    if(oldMessage.content === newMessage.content) return;

    //Comprueba si el contenido del mensaje estaba permitido
    await client.functions.moderation.checkMessage.run(client, newMessage);
};
