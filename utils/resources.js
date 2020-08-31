exports.run = (discord, bot) => {
    
    //SERVIDOR PRINCIPAL
    const server = bot.guilds.cache.get('374945492133740544');
    module.exports.server = server;

    //FUNCIONES
    //Función para buscar miembros
    async function fetchMember(guild, argument) {
        try {
            let result;
            const matches = argument.match(/^<@!?(\d+)>$/);
            if (matches) {
                result = await guild.members.fetch(matches[1]);
            } else if (!isNaN(argument)) {
                result = await guild.members.fetch(argument);
            }
            if (result && typeof result !== 'undefined') return result;
        } catch (e) {
            return false;
        }
    };
    module.exports.fetchMember = fetchMember;

    //Función para buscar usuarios
    async function fetchUser(argument) {
        try {
            let result;
            const matches = argument.match(/^<@!?(\d+)>$/);
            if (matches) {
                result = await bot.users.fetch(matches[1]);
            } else if (!isNaN(argument)) {
                result = await bot.users.fetch(argument);
            }
            if (result && typeof result !== 'undefined') return result;
        } catch (e) {
            return false;
        }
    };
    module.exports.fetchUser = fetchUser;
    
    //COLORES
    const gold = '0xFFC857';
    module.exports.gold = gold;
    
    const red = '0xF04647';
    module.exports.red = red;
    
    const red2 = '0xF12F49';
    module.exports.red2 = red2;
    
    const green = '0xB8E986';
    module.exports.green = green;
    
    const green2 = '0x3EB57B';
    module.exports.green2 = green2;
    
    const gray = '0xC6C9C6';
    module.exports.gray = gray;
    
    const blue = '0x4A90E2';
    module.exports.blue = blue;
    
    const blue2 = '0x7CD6F9';
    module.exports.blue2 = blue2;
    
    const orange = '0xF8A41E';
    module.exports.orange = orange;
    
    const brown = `0xCBAC88`;
    module.exports.brown = brown;
    
    const lilac = `0xA3B3EE`;
    module.exports.lilac = lilac;
    
    //VARIABLES MODIFICABLES
    const valueCheck = 'null';
    module.exports.valueCheck = valueCheck;
    
    //EMOJIS
    const GreenTick = bot.emojis.cache.get('496633289726099478');
    module.exports.GreenTick = GreenTick;
    
    const GrayTick = bot.emojis.cache.get('496633289809854474');
    module.exports.GrayTick = GrayTick;
    
    const RedTick = bot.emojis.cache.get('496633289528836108');
    module.exports.RedTick = RedTick;
    
    const OrangeTick = bot.emojis.cache.get('499215590741901312');
    module.exports.OrangeTick = OrangeTick;
    
    const beta = bot.emojis.cache.get('496633935174828034');
    module.exports.beta = beta;
    
    const fortnite = bot.emojis.cache.get('496633644954419210');
    module.exports.fortnite = fortnite;
    
    const pilkobot = bot.emojis.cache.get('496633714802032655');
    module.exports.pilkobot = pilkobot;
    
    const republicagamer = bot.emojis.cache.get('498288236607569962');
    module.exports.republicagamer = republicagamer;
    
    const musicBox = bot.emojis.cache.get('503128880933240832');
    module.exports.musicBox = musicBox;
    
    const shield = bot.emojis.cache.get('499209508275355648');
    module.exports.shield = shield;
    
    const coin = bot.emojis.cache.get('496634668758859786');
    module.exports.coin = coin;
    
    const nitro = bot.emojis.cache.get('496633448686157826');
    module.exports.nitro = nitro;
    
    const verified = bot.emojis.cache.get('496633324010471424');
    module.exports.verified = verified;
    
    const boxbot = bot.emojis.cache.get('497178946149023744');
    module.exports.boxbot = boxbot;
    
    const drakeban = bot.emojis.cache.get('497381029011521593');
    module.exports.drakeban = drakeban;
    
    const translate = bot.emojis.cache.get('503248605814063105');
    module.exports.translate = translate;
    
    const rythm = bot.emojis.cache.get('507187604031275008');
    module.exports.rythm = rythm;
    
    const rythm2 = bot.emojis.cache.get('507187615402033155');
    module.exports.rythm2 = rythm2;

    const chevron10 = bot.emojis.cache.get('497133468535226389');
    module.exports.chevron10 = chevron10;
    
    const chevron11 = bot.emojis.cache.get('497133469495721986');
    module.exports.chevron11 = chevron11;
    
    const chevron = bot.emojis.cache.get('497133469110108189');
    module.exports.chevron = chevron;
    
    const chevron5 = bot.emojis.cache.get('497133468791341116');
    module.exports.chevron5 = chevron5;
    
    const chevron9 = bot.emojis.cache.get('497133468741009411');
    module.exports.chevron9 = chevron9;
    
    const chevron15 = bot.emojis.cache.get('497133469059645460');
    module.exports.chevron15 = chevron15;
    
    const chevron18 = bot.emojis.cache.get('497133469529538560');
    module.exports.chevron18 = chevron18;
}