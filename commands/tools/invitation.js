exports.run = async (client, message, args, command, commandConfig) => {
    
    try {

        //Genera el embed y lo envía, buscando el contenido necesario con la función
        await message.channel.send({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.primary)
            .setAuthor({ name: 'Invitación permanente', iconURL: client.homeGuild.iconURL({dynamic: true}) })
            .setDescription(await client.functions.getBotServerInvite())
            .setFooter({ text: 'Este enlace nunca caduca y tiene usos ilimitados' })
        ]});
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'invitation',
    description: 'Genera o recupera un enlace de invitación permanente en el canal de reglas, o en el primer canal de texto que lo permita.',
    aliases: ['perminvite', 'invite'],
    parameters: ''
};
