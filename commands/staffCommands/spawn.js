exports.run = (discord, fs, config, token, bot, message, args, command, roles, loggingChannel) => {
    
    const url = message.content.slice(7);

    if (url.length > 0) {

        message.delete();

        let resultEmbed = new discord.RichEmbed()
            .setColor(0x00AF85)
            .setTitle('A wild pokémon has appeared!')
            .setDescription('Guess the pokémon and type p!catch <pokémon> to catch it!')
            .setImage(url);
        message.channel.send(resultEmbed);

        //await message.channel.send('p!catch ' + args[2])

        //.then(message.channel.send('Congratulations '+ message.author.username +'! You caught a level ' + math.random + ' ' + args[2]))

    } else {
        console.log (new Date().toUTCString() + ' 》' + message.author.username + ' no proporcionó suficientes argumentos para ejecutar el comando: ' + message.content + ' en ' + message.guild.name);
        let errorEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setDescription('❌ ' + message.author.username + ', debes escribir la URL de la imagen a Spawnear');
        message.channel.send(errorEmbed);
    }
}
