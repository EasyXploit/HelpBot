exports.run = (event, discord, fs, config, keys, bot, resources) => {
    
    //Previene que continue la ejecución si el servidor no es la República Gamer
    if (event.guild.id !== `374945492133740544`) return;

    const loggingChannel = bot.channels.get(config.loggingChannel);
    
    if (!event.user.bot) {
        console.log(`${new Date().toUTCString()} 》@${event.user.tag} abandonó la guild: ${event.guild.name}`);

        let embed = new discord.RichEmbed()
            .setColor(resources.orange)
            .addField(`📑 Auditoría`, `@${event.user.tag} abandonó el servidor ↗`)
            .setFooter(`© 2018 República Gamer LLC`, resources.server.iconURL)
            .setTimestamp();
        loggingChannel.send(embed);
    } else {
        if (event.user.id === bot.user.id) return;
        let loggingGoodbyeBotEmbed = new discord.RichEmbed()
            .setColor(resources.orange)
            .addField(`📑 Auditoría`, `El **BOT** @${event.user.tag} fue eliminado del servidor ↗`)
            .setFooter(`© 2018 República Gamer LLC`, resources.server.iconURL).setTimestamp();
        loggingChannel.send(loggingGoodbyeBotEmbed)
        return;
    }
}
