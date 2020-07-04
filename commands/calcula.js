exports.run = (discord, fs, config, keys, bot, message, args, command, loggingChannel, debuggingChannel, resources) => {
    
    //!calcula (número 1) (+ | - | * | / | round | pow | sqrt | abs | ceil | floor | sin | cos) (número 2 si procede)
    
    try {
        if (args.join(' ').toLowerCase() === 'yo + ella' || args.join(' ').toLowerCase() === 'ella + yo' || args.join(' ').toLowerCase() === 'yo+ella' || args.join(' ').toLowerCase() === 'ella+yo') {
            let resultEmbed = new discord.MessageEmbed()
                .setColor(0x3D8AC2)
                .setDescription('🔢 | **Resultado:** ' + 'Eso no es posible')
                .setFooter('Operación sugerida: ella + el');
            return message.channel.send(resultEmbed);
        } else if (args.join(' ').toLowerCase() === 'el + ella' || args.join(' ').toLowerCase() === 'ella + el' || args.join(' ').toLowerCase() === 'el+ella' || args.join(' ').toLowerCase() === 'ella+el' || args.join(' ').toLowerCase() === 'él + ella' || args.join(' ').toLowerCase() === 'ella + él' || args.join(' ').toLowerCase() === 'él+ella' || args.join(' ').toLowerCase() === 'ella+él') {
            let resultEmbed = new discord.MessageEmbed()
                .setColor(0x3D8AC2)
                .setDescription('🔢 | **Resultado:** ' + 'Jamás será tuya')
                .setFooter('Ella es feliz con él');
            return message.channel.send(resultEmbed);
        }
        
        let noCorrectSyntaxEmbed = new discord.MessageEmbed()
            .setColor(0xF04647)
            .setDescription(resources.RedTick + ' La sintaxis de este comando es `' + config.prefix + 'calcula (número 1) (+ | - | * | / | round | pow | sqrt | abs | ceil | floor | sin | cos) (número 2 si procede)`');
        
        if (!args[0] || !args[1]) return message.channel.send(noCorrectSyntaxEmbed);
        
        let operator = args[1];
        if (operator !== '+' && operator !== '-' && operator !== '*' && operator !== '/' && operator !== 'pi' && operator !== 'round' && operator !== 'pow' && operator !== 'sqrt' && operator !== 'abs' && operator !== 'ceil' && operator !== 'floor' && operator !== 'sin' && operator !== 'cos') return message.channel.send(noCorrectSyntaxEmbed);
        
        let isNaNEmbed = new discord.MessageEmbed()
            .setColor(0xF04647)
            .setDescription(resources.RedTick + ' Debes proporcionar números enteros');
        
        if (isNaN(args[0])) return message.channel.send(isNaNEmbed);
        let N1 = parseInt(args[0]);
        
        let noN2Embed = new discord.MessageEmbed()
            .setColor(0xF04647)
            .setDescription(resources.RedTick + ' Debes proporcionar una segunda cifra');
        
        let operation;
        let result;
        
        if (operator === '+') {
            if (!args[2]) return message.channel.send(noN2Embed)
            if (isNaN(args[2])) return message.channel.send(isNaNEmbed);
            
            let N2 = parseInt(args[2]);
            operation = 'La suma de ' + N1 + ' y ' + N2;
            result = N1 + N2;
        } else if (operator === '-') {
            if (!args[2]) return message.channel.send(noN2Embed)
            if (isNaN(args[2])) return message.channel.send(isNaNEmbed);
            
            let N2 = parseInt(args[2]);
            operation = 'La resta de ' + N1 + ' y ' + N2;
            result = N1 - N2;
        } else if (operator === '*') {
            if (!args[2]) return message.channel.send(noN2Embed)
            if (isNaN(args[2])) return message.channel.send(isNaNEmbed);
            
            let N2 = parseInt(args[2]);
            operation = 'La multiplicación de ' + N1 + ' y ' + N2;
            result = N1 * N2;
        } else if (operator === '/') {
            if (!args[2]) return message.channel.send(noN2Embed)
            if (isNaN(args[2])) return message.channel.send(isNaNEmbed);
            
            let N2 = parseInt(args[2]);
            operation = 'La división de ' + N1 + ' entre ' + N2;
            result = N1 / N2;
        } else if (operator === 'round') {
            operation = N1 + ' redondeado';
            result = Math.round(N1);
        } else if (operator === 'pow') {
            if (!args[2]) return message.channel.send(noN2Embed)
            if (isNaN(args[2])) return message.channel.send(isNaNEmbed);
            
            let N2 = parseInt(args[2]);
            operation = N1 + ' a la potencia de ' + N2;
            result = Math.pow(N1, N2);
        } else if (operator === 'sqrt') {
            operation = 'Raiz cuadrada de ' + N1;
            result = Math.sqrt(N1);
        } else if (operator === 'abs') {
            operation = 'Abosulto (positivo) de ' + N1;
            result = Math.abs(N1);
        } else if (operator === 'ceil') {
            operation = N1 + ' redondeado hacia arriba hasta el entero más próximo';
            result = Math.ceil(N1);
        } else if (operator === 'floor') {
            operation = N1 + ' redondeado hacia abajo hasta el entero más próximo';
            result = Math.floor(N1);
        } else if (operator === 'sin') {
            operation = 'El seno de ' + N1;
            result = Math.sin(N1 * Math.PI / 180);
        } else if (operator === 'cos') {
            operation = 'El coseno de ' + N1;
            result = Math.cos(N1 * Math.PI / 180);
        }

        const resultEmbed = new discord.MessageEmbed()
            .setColor(0x3D8AC2)
            .setDescription('🔢 | **Resultado:** ' + result)
            .setFooter(operation);

        message.channel.send(resultEmbed);
    } catch (e) {
        require('../errorHandler.js').run(discord, config, bot, message, args, command, e);
    }
}
