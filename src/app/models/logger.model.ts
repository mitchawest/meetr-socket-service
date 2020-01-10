import winston from 'winston';
import { ColorizeOptions } from 'logform';
import util from 'util';

/* This class creates a winston logger and transports when instantiated with the necessary configuration options. A console logger transport is created by default
    and other transports can be added if the configurations are included */
export default class WinstonLogger {
    private logger: winston.Logger;

    constructor(minimumLevel: string, levels: winston.LoggerOptions['levels'], colors?: ColorizeOptions['colors'], namespace?: string, logConsole?: boolean, logFilePath?: string) {
        const transports = [];
        if (logConsole) transports.push(new winston.transports.Console());
        if (logFilePath) {
            const fileName = `log_${new Date()
                .toISOString()
                .replace(/-/g, '_')
                .replace(/:/g, '_')
                .replace(/\./g, '_')}`;
            transports.push(
                new winston.transports.File({
                    filename: fileName,
                    dirname: logFilePath,
                    level: minimumLevel
                })
            );
        }

        /* create the logger */
        this.logger = winston.createLogger({
            level: minimumLevel,
            levels: levels,
            format: winston.format.combine(
                winston.format.prettyPrint(),
                winston.format.timestamp(),
                winston.format.splat(),
                colors
                    ? winston.format.colorize({
                          level: true,
                          colors: colors
                      })
                    : undefined,
                winston.format.printf(msg => `${msg.timestamp} ${namespace ? `[${namespace}]` : null} ${msg.level}: ${msg.message}`)
            ),
            transports: transports,
            exitOnError: false,
            silent: !logConsole
        });
    }

    /* This adds a log method that allows for both strings or objects to be passed and prevents any issues with JSON.stringify on objects with a circular reference */
    log = (message: string | object, level: string) => {
        if (typeof message !== 'object') this.logger.log(level, message);
        if (typeof message === 'object') this.logger.log(level, util.format('%o', message));
    };
}
