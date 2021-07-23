exports.run = async (discord, client, message, args, command, commandConfig) => {
    
    //!rps <piedra | papel | tijeras>
    
    try {
        let notToAnswerEmbed = new discord.MessageEmbed()
            .setColor(client.colors.red2)
            .setDescription(`${client.customEmojis.redTick} La sintaxis de este comando es \`${client.config.guild.prefix}rps <piedra | papel | tijeras>\``);

        if (!args[0]) return message.channel.send(notToAnswerEmbed);

        let opponent = args[0].toLowerCase();
        if (opponent !== 'piedra' && opponent !== 'papel' && opponent !== 'tijeras') return message.channel.send(notToAnswerEmbed);

        const data = ['piedra', 'papel', 'tijeras'];
        let choose = data[Math.floor(Math.random() * data.length)];

        let emojiOpponentChoose;
        let emojiChoose;
        let result;
        let reason;

        if (choose === 'piedra') {
            emojiChoose = '💎';
            switch (opponent) {
                case 'piedra':
                    emojiOpponentChoose = '💎';
                    result = '**EMPATE**';
                    reason = 'Se anulan el uno al otro';
                    break;
                case 'papel':
                    emojiOpponentChoose = '📄';
                    result = '**GANASTE**';
                    reason = 'El papel cubre la piedra';
                    break;
                case 'tijeras':
                    emojiOpponentChoose = '✂';
                    result = '**PERDISTE**';
                    reason = 'La piedra aplasta las tijeras';
                    break;
            }
        } else if (choose === 'papel') {
            emojiChoose = '📄';
            switch (opponent) {
                case 'piedra':
                    emojiOpponentChoose = '💎';
                    result = '**PERDISTE**';
                    reason = 'El papel cubre la piedra';
                    break;
                case 'papel':
                    emojiOpponentChoose = '📄';
                    result = '**EMPATE**';
                    reason = 'Se anulan el uno al otro';
                    break;
                case 'tijeras':
                    emojiOpponentChoose = '✂';
                    result = '**GANASTE**';
                    reason = 'Las tijeras cortan el papel';
                    break;
            }
        } else if (choose === 'tijeras') {
            emojiChoose = '✂';
            switch (opponent) {
                case 'piedra':
                    emojiOpponentChoose = '💎';
                    result = '**GANASTE**';
                    reason = 'La piedra aplasta las tijeras';
                    break;
                case 'papel':
                    emojiOpponentChoose = '📄';
                    result = '**PERDISTE**';
                    reason = 'Las tijeras cortan el papel';
                    break;
                case 'tijeras':
                    emojiOpponentChoose = '✂';
                    result = '**EMPATE**';
                    reason = 'Se anulan el uno al otro';
                    break;
            }
        }

        const resultEmbed = new discord.MessageEmbed()
            .setColor(0xF74A4A)
            .setTitle(`${message.member.displayName} ${emojiOpponentChoose} VS ${emojiChoose} ${client.user.username}`)
            .setDescription(`__Resultado:__ ¡${result}!`)
            .setFooter(`| ${reason}`, client.homeGuild.iconURL());

        message.channel.send(resultEmbed);
    } catch (error) {
        await client.functions.commandErrorHandler(error, message, command, args);
    };
};

module.exports.config = {
    name: 'rps',
    aliases: []
};
