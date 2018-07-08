// Muestra un output en caso de que el bot abandone una guild

exports.run = (bot, ...args) => {
    bot.on("guildDelete", guild => {
        console.log(`》Pilko Bot abandonó la guild: ${guild.name} a las ${new Date()}`);
    })
}