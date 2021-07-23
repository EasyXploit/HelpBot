exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!urban (término)
    
    try {

        let notToSearchEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setTitle(`${client.customEmojis.redTick} Debes proporcionar un término de búsqueda.`)
            .setDescription(`La sintaxis de este comando es \`${client.config.guild.prefix}urban (término)\`.`);
    
        if (!args[0]) return message.channel.send(notToSearchEmbed);

        const searchTerm = args.join(' ');
        const urbanDictionary = require('urban-dictionary');

        urbanDictionary.define(searchTerm).then(async (results) => {
            const result = results[0];

            const resultEmbed = new discord.MessageEmbed()
                .setColor(0x1D2339)
                .attachFiles(new discord.MessageAttachment('./resources/images/urban.png', 'urban.png'))
                .setThumbnail('attachment://urban.png')
                .setTitle(`📔 | Definición de: __${result.word.toUpperCase()}__`)
                .setDescription(result.definition)
                .addField('Valoraciones:', `Likes: ${result.thumbs_up} | Dislikes: ${result.thumbs_down}`, true)
                .setFooter(`Escrito por: ${result.author}`);

            await message.channel.send(resultEmbed);
        }).catch(async (error) => {
            const noResultEmbed = new discord.MessageEmbed()
                .setColor(client.colors.red2)
                .setDescription(`${client.customEmojis.redTick} No se ha encontrado ningún resultado que coincida con \`${searchTerm}\`.`);
            
            if (error.toString().includes('No results found')) return message.channel.send(noResultEmbed);
            await client.functions.commandErrorHandler(error, message, command, args);
        });
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'urban',
    aliases: ['dictionary']
};
