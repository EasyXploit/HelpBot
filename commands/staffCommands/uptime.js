exports.run = (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel) => {
    
    try {
        async function convertMS( milliseconds ) {
            var day, hour, minute, seconds;
            seconds = Math.floor(milliseconds / 1000);
            minute = Math.floor(seconds / 60);
            seconds = seconds % 60;
            hour = Math.floor(minute / 60);
            minute = minute % 60;
            day = Math.floor(hour / 24);
            hour = hour % 24;
            
            const resultEmbed = new discord.RichEmbed()
                .setColor(0xFFC857)
                .setTitle('🕐 Tiempo de actividad:')
                .setDescription(day + ' días, ' + hour + ' horas, ' + minute + ' minutos y ' + seconds + ' segundos');
            message.channel.send(resultEmbed);
        }
        convertMS(bot.uptime);
    } catch (e) {
        console.error(new Date().toUTCString() + ' 》' + e);
        let errorEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setTitle('❌ Ocurrió un error')
            .addField('Se declaró el siguiente error durante la ejecución del comando:', e, true);
        message.channel.send(errorEmbed);
    }
}
