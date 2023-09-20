// Exports a function to load the logging system
export async function loadLogger() {

    // Stores the library to generate logs
    const winston = require('winston');

    // Loads the repository configuration
    const packageConfig = require('./package.json');

    // Generates a format for the information logs in console
    const simpleFormat = winston.format.printf(({ message }) => {
        return `》${message}`;
    });

    // Generates a format for the development logs
    const extendedFormat = winston.format.printf(({ level, message, label, timestamp }) => {
        return `${timestamp} [${label}] ${level}: ${message}`;
    });

    // Generates personalized levels
    const customLevels = {
        info: 0,
        error: 1,
        warn: 2,
        debug: 3
    };

    // Depending on the type of environment
    if (process.env.NODE_ENV === 'production') {

        // Imports the library to rotate the logs
        const DailyRotateFile = require('winston-daily-rotate-file');
        
        // Verifies and creates the log directory if doesn't exist
        if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');
    
        // Records the loggers with their respective routes and formats
        global.logger = winston.createLogger({
            levels: customLevels,  // To use custom levels
            transports: [
                new winston.transports.Console({
                    level: 'info', // Will manage only 'info' logs
                    format: winston.format.combine(
                        simpleFormat
                    ),
                }),
                new DailyRotateFile({
                    filename: 'logs/logs-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxFiles: '14d',  // Sets the maximum number of days to retain files
                    level: 'debug',   //  Will handle logs of the 'Debug', 'Warn', 'Error' and 'Info' types
                    format: winston.format.combine(
                        winston.format.label({ label: `v${packageConfig.version}` }),
                        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                        extendedFormat
                    ),
                }),
            ]
        });
        
    } else {

        // Records each logger with its proper format
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
