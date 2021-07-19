exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!moneda
    
    try {
        const datos = ['CARA', 'CARA', 'CARA', 'CARA', 'CARA', 'CRUZ', 'CRUZ', 'CRUZ', 'CRUZ', 'CRUZ', 'CANTO.. ¿CANTO?'];

        const resultEmbed = new discord.MessageEmbed()
            .setColor(0xEAE151)
            .setTitle('Lanzaste una moneda ...  🪙')
            .setDescription(`¡Salió __**${datos[Math.floor(Math.random() * datos.length)]}**__!`);
        message.channel.send(resultEmbed);
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    }
}
