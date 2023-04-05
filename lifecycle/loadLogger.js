exports.run = () => {

    //Almacena la librería para generar logs
    const winston = require('winston')

    //Registra la librería de manera global
    global.logger = winston;

    //Si no es un entorno de producción, devuelve la cosola cómo logger
    if (process.env.NODE_ENV !== 'production') return global.logger = console;

    //Carga la configuración del repositorio
    const packageConfig = require('../package.json');

    //Genera un formato para los logs de información
    const infoFormat = winston.format.printf(({ message }) => {
        return `${message}`;
    });

    //Genera un formato para los logs de depuración
    const debugFormat = winston.format.printf(({ level, message, label, timestamp }) => {
        return `${timestamp} [${label}] ${level}: ${message}`;
    });

    //Genera un formato para los logs de error
    const errorFormat = winston.format.printf(({ level, message, label, timestamp }) => {
        return `${timestamp} [${label}] ${level}: ${message}`;
    });

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
                    winston.format.label({ label: `V. ${packageConfig.version}` }),
                    winston.format.timestamp(),
                    debugFormat
                ),
            }),
            new winston.transports.File({
                filename: './logs/debug.log',
                level: 'warn',
                format: winston.format.combine(
                    winston.format.label({ label: `V. ${packageConfig.version}` }),
                    winston.format.timestamp(),
                    debugFormat
                ),
            }),
            new winston.transports.File({
                filename: './logs/errors.log',
                level: 'error',
                format: winston.format.combine(
                    winston.format.label({ label: `V. ${packageConfig.version}` }),
                    winston.format.timestamp(),
                    errorFormat
                ),
            })
        ]
    });
};
