exports.run = (discord, fs, config, keys, bot, message, args, command, roles, loggingChannel, emojis) => {
    
    let notToAnswerEmbed = new discord.RichEmbed()
        .setColor(0xF12F49)
        .setDescription('❌ La sintaxis de este comando es `' + config.prefix + 'ppt <piedra | papel | tijeras | lagarto | spock>`');
    
    if (!args[0]) return message.channel.send(notToAnswerEmbed);
    
    let opponent = args[0].toLowerCase();
    if (opponent !== 'piedra' && opponent !== 'papel' && opponent !== 'tijeras' && opponent !== 'lagarto' && opponent !== 'spock') return message.channel.send(notToAnswerEmbed);
 
    const data = ['piedra', 'papel', 'tijeras', 'lagarto', 'spock'];
    let choose = data[Math.floor(Math.random() * data.length)];
    
    let emojiOpponentChoose;
    let emojiChoose;
    let result;
    let reason;
    
    try {
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
                case 'lagarto':
                    emojiOpponentChoose = '🦎';
                    result = '**PERDISTE**';
                    reason = 'La piedra aplasta al lagarto';
                    break;
                case 'spock':
                    emojiOpponentChoose = '🧝‍';
                    result = '**GANASTE**';
                    reason = 'Spock vaporiza la piedra';
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
                case 'lagarto':
                    emojiOpponentChoose = '🦎';
                    result = '**GANASTE**';
                    reason = 'El lagarto se come el papel';
                    break;
                case 'spock':
                    emojiOpponentChoose = '🧝‍';
                    result = '**PERDISTE**';
                    reason = 'El papel desaprueba a Spock';
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
                case 'lagarto':
                    emojiOpponentChoose = '🦎';
                    result = '**PERDISTE**';
                    reason = 'Las tijeras decapitan al lagarto';
                    break;
                case 'spock':
                    emojiOpponentChoose = '🧝‍';
                    result = '**GANASTE**';
                    reason = 'Spock rompe las tijeras';
                    break;
            }
        } else if (choose === 'lagarto') {
            emojiChoose = '🦎';
            switch (opponent) {
                case 'piedra':
                    emojiOpponentChoose = '💎';
                    result = '**GANASTE**';
                    reason = 'La piedra aplasta al lagarto';
                    break;
                case 'papel':
                    emojiOpponentChoose = '📄';
                    result = '**PERDISTE**';
                    reason = 'El lagarto se come el papel';
                    break;
                case 'tijeras':
                    emojiOpponentChoose = '✂';
                    result = '**GANASTE**';
                    reason = 'Las tijeras decapitan al lagarto';
                    break;
                case 'lagarto':
                    emojiOpponentChoose = '🦎';
                    result = '**EMPATE**';
                    reason = 'Se anulan el uno al otro';
                    break;
                case 'spock':
                    emojiOpponentChoose = '🧝‍';
                    result = '**PERDISTE**';
                    reason = 'El lagarto envenena a Spock';
                    break;
            }
        } else if (choose === 'spock') {
            emojiChoose = '🧝‍';
            switch (opponent) {
                case 'piedra':
                    emojiOpponentChoose = '💎';
                    result = '**PERDISTE**';
                    reason = 'Spock vaporiza la piedra';
                    break;
                case 'papel':
                    emojiOpponentChoose = '📄';
                    result = '**GANASTE**';
                    reason = 'El papel desaprueba a Spock';
                    break;
                case 'tijeras':
                    emojiOpponentChoose = '✂';
                    result = '**PERDISTE**';
                    reason = 'Spock rompe las tijeras';
                    break;
                case 'lagarto':
                    emojiOpponentChoose = '🦎';
                    result = '**GANASTE**';
                    reason = 'El lagarto envenena a Spock';
                    break;
                case 'spock':
                    emojiOpponentChoose = '🧝‍';
                    result = '**EMPATE**';
                    reason = 'Se anulan el uno al otro';
                    break;
            }
        }
    } catch (e) {
        console.error(new Date().toUTCString() + ' 》' + e);
        let errorEmbed = new discord.RichEmbed()
            .setColor(0xF12F49)
            .setTitle('❌ Ocurrió un error')
            .addField('Se declaró el siguiente error durante la ejecución del comando:', e, true);
        message.channel.send(errorEmbed);
    }
    
    const resultEmbed = new discord.RichEmbed()
        .setColor(0x00AFC4)
        .setTitle(message.member.displayName + ' ' + emojiOpponentChoose + ' VS ' + emojiChoose + ' ' + bot.user.username)
        .setDescription('__Resultado:__ ¡' + result + '!')
        .setFooter(reason)
    
    message.channel.send(resultEmbed);
}
