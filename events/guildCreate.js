// Muestra un output en caso de que el bot se una a una nueva guild

exports.run = (bot) => {
    bot.on("guildCreate", guild => {
        console.log("》Pilko Bot se unió a la guild: " + guild.name);
    })
}