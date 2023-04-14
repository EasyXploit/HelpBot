//Exporta una función para cargar el sistema de logs
export async function loadLogger() {

    //Almacena la librería para generar logs
    const winston = require('winston');

    //Carga la configuración del repositorio
    const packageConfig = require('./package.json');

    //Genera un formato para los logs de información
    const infoFormat = winston.format.printf(({ message }) => {
        return `》${message}`;
    });

    //Genera un formato para los logs de depuración
    const debugFormat = winston.format.printf(({ level, message, label, timestamp }) => {
        return `${timestamp} [${label}] ${level}: ${message}`;
    });

    //Genera un formato para los logs de error
    const errorFormat = winston.format.printf(({ level, message, label, timestamp }) => {
        return `${timestamp} [${label}] ${level}: ${message}`;
    });

    //En función del tipo de entorno
    if (process.env.NODE_ENV !== 'production') {

        //Registra los loggers con sus respectivas rutas y formatos
        global.logger = winston.createLogger({
            transports: [
                new winston.transports.Console({
                    level: 'debug',
                    format: winston.format.combine(
                        winston.format.colorize({
                            all:true
                        }),
                        winston.format.label({ label: `v${packageConfig.version}` }),
                        winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
                        debugFormat
                    ),
                }),
                new winston.transports.Console({
                    level: 'warn',
                    format: winston.format.combine(
                        winston.format.colorize({
                            all:true
                        }),
                        winston.format.label({ label: `v${packageConfig.version}` }),
                        winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
                        debugFormat
                    ),
                }),
                new winston.transports.Console({
                    level: 'error',
                    format: winston.format.combine(
                        winston.format.colorize({
                            all:true
                        }),
                        winston.format.label({ label: `v${packageConfig.version}` }),
                        winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
                        errorFormat
                    ),
                })
            ]
        });

    } else {

        //Registra los loggers con sus respectivas rutas y formatos
        global.logger = winston.createLogger({
            transports: [
                new winston.transports.Console({
                    level: 'info',
                    format: winston.format.combine(
                        infoFormat
                    ),
                }),
                new winston.transports.File({
                    filename: './logs/debug.log',
                    level: 'debug',
                    format: winston.format.combine(
                        winston.format.label({ label: `v${packageConfig.version}` }),
                        winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
                        debugFormat
                    ),
                }),
                new winston.transports.File({
                    filename: './logs/debug.log',
                    level: 'warn',
                    format: winston.format.combine(
                        winston.format.label({ label: `v${packageConfig.version}` }),
                        winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
                        debugFormat
                    ),
                }),
                new winston.transports.File({
                    filename: './logs/errors.log',
                    level: 'error',
                    format: winston.format.combine(
                        winston.format.label({ label: `v${packageConfig.version}` }),
                        winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
                        errorFormat
                    ),
                })
            ]
        });
    };
};
