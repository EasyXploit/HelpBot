//Exporta una función para cargar el sistema de logs
export async function loadLogger() {

    //Almacena la librería para generar logs
    const winston = require('winston');

    //Carga la configuración del repositorio
    const packageConfig = require('./package.json');

    //Genera un formato para los logs de información en consola
    const simpleFormat = winston.format.printf(({ message }) => {
        return `》${message}`;
    });

    //Genera un formato para los logs de desarrollo
    const extendedFormat = winston.format.printf(({ level, message, label, timestamp }) => {
        return `${timestamp} [${label}] ${level}: ${message}`;
    });

    //Genera niveles personalizados
    const customLevels = {
        info: 0,
        error: 1,
        warn: 2,
        debug: 3
    };

    //En función del tipo de entorno
    if (process.env.NODE_ENV === 'production') {

        //Importa la librería para rotar los logs
        const DailyRotateFile = require('winston-daily-rotate-file');
        
        //Verifica y crear el directorio de logs si no existe
        if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');
    
        //Registra los loggers con sus respectivas rutas y formatos
        global.logger = winston.createLogger({
            levels: customLevels,  //Para usar los niveles personalizados
            transports: [
                new winston.transports.Console({
                    level: 'info', //Manejará sólo logs 'info'
                    format: winston.format.combine(
                        simpleFormat
                    ),
                }),
                new DailyRotateFile({
                    filename: 'logs/logs-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxFiles: '14d',  //Establece el número máximo de días para retener los archivos
                    level: 'debug',   //Manejará logs 'debug', 'warn', 'error' e 'info'
                    format: winston.format.combine(
                        winston.format.label({ label: `v${packageConfig.version}` }),
                        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                        extendedFormat
                    ),
                }),
            ]
        });
        
    } else {

        //Registra cada logger con su formato adecuado
        global.logger = winston.createLogger({
            levels: customLevels,
            transports: [
                new winston.transports.Console({
                    level: 'debug',
                    format: winston.format.combine(
                        winston.format.colorize({
                            all: true
                        }),
                        winston.format.label({ label: `v${packageConfig.version}` }),
                        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                        extendedFormat
                    ),
                })
            ]
        });
    };
};
