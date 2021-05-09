exports.run = async (client) => {

    //Crea un objeto para almacenar todos los emotes
    client.emotes = {};
    
    //EMOTES
    client.emotes.banned = client.emojis.cache.get('437727132660138024');
    client.emotes.greenTick = client.emojis.cache.get('496633289726099478');
    client.emotes.grayTick = client.emojis.cache.get('496633289809854474');
    client.emotes.redTick = client.emojis.cache.get('496633289528836108');
    client.emotes.orangeTick = client.emojis.cache.get('499215590741901312');
    client.emotes.beta = client.emojis.cache.get('496633935174828034');
    client.emotes.dj = client.emojis.cache.get('757768901693145249');
    client.emotes.pilkobot = client.emojis.cache.get('496633714802032655');
    client.emotes.republicagamer = client.emojis.cache.get('498288236607569962');
    client.emotes.musicBox = client.emojis.cache.get('503128880933240832');
    client.emotes.shield = client.emojis.cache.get('499209508275355648');
    client.emotes.coin = client.emojis.cache.get('496634668758859786');
    client.emotes.nitro = client.emojis.cache.get('496633448686157826');
    client.emotes.boxbot = client.emojis.cache.get('497178946149023744');
    client.emotes.translate = client.emojis.cache.get('503248605814063105');
    client.emotes.rythm = client.emojis.cache.get('507187604031275008');
    client.emotes.chevron1 = client.emojis.cache.get('497133469110108189');
    client.emotes.chevron2 = client.emojis.cache.get('497133468791341116');
    client.emotes.chevron3 = client.emojis.cache.get('497133468741009411');
    client.emotes.chevron4 = client.emojis.cache.get('497133469059645460');
    client.emotes.chevron5 = client.emojis.cache.get('497133469529538560');
};
