exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!dice
    
    try {
        const datos = ['1', '2', '3', '4', '5', '6'];

        const resultEmbed = new discord.MessageEmbed()
            .setColor(0xDDDDDD)
            .setTitle('Lanzaste un dado ...  🎲')
            .setDescription(`¡Salió **${datos[Math.floor(Math.random() * datos.length)]}**!`);
        message.channel.send(resultEmbed);
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    }
}
