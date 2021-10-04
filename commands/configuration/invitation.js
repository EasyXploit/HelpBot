exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!invitation
    
    try {

        //Genera el embed, buscando el contenido necesario con la función
        let invitationEmbed = new discord.MessageEmbed()
            .setColor(client.config.colors.primary)
            .setAuthor('Invitación permanente', client.homeGuild.iconURL({dynamic: true}))
            .setDescription(await client.functions.getBotServerInvite())
            .setFooter('Este enlace nunca caduca y tiene usos ilimitados');

        //Envía el mensaje
        await message.channel.send({ embeds: [invitationEmbed] });
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'invitation',
    aliases: ['perminvite', 'invite']
};
