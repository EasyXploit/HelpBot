exports.run = (discord, fs, client, message, args, command) => {
    
    //!dado
    
    try {
        const datos = ['1', '2', '3', '4', '5', '6'];

        const resultEmbed = new discord.MessageEmbed()
            .setColor(0xDDDDDD)
            .setTitle('Lanzaste un dado ...  🎲')
            .setDescription(`¡Salió **${datos[Math.floor(Math.random() * datos.length)]}**!`);
        message.channel.send(resultEmbed);
    } catch (e) {
        require('../utils/errorHandler.js').run(discord, client, message, args, command, e);
    }
}
