exports.run = (discord, fs, config, token, bot, message, args) => {
    
    var text = message.content.slice(4)

    if (text.length > 0) {
        console.log (new Date() + " 》" + message.author.username + " introdujo el comando:  " + message.content + "  en  " + message.guild.name);
        message.delete();
        
        let embed = new discord.RichEmbed()
            .setColor(16762967)
            .setDescription(text)
        message.channel.send({embed})
        
        .catch ((err) => {
            console.error(new Date() + " 》" + err);

            let embed = new discord.RichEmbed()
                .setColor(15806281)
                .setTitle("❌ Ocurrió un error")
                .setDescription("Ocurrió un error durante la ejecución del comando")
            message.channel.send({embed})
        })
    } else {
        console.log (new Date() + " 》" + message.author.username + " no proporcionó suficientes argumentos para ejecutar el comando:  " + message.content + "  en  " + message.guild.name);
        
        let embed = new discord.RichEmbed()
            .setColor(15806281)
            .setDescription(message.author.username + ", debes escribir el contenido del mensaje")
        message.channel.send({embed})
        
        .catch ((err) => {
            console.error(new Date() + " 》" + err);

            let embed = new discord.RichEmbed()
                .setColor(15806281)
                .setTitle("❌ Ocurrió un error")
                .setDescription("Ocurrió un error durante la ejecución del comando")
            message.channel.send({embed})
        })
    }
}
