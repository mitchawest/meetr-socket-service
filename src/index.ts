import init from '@app/server';
import fs from 'fs';
import { LEVELS } from '@util/enums';

/* Load env variables from .env file if non-production environment*/
if (process.env.NODE_ENV && process.env.NODE_ENV.toUpperCase() !== 'PROD' && process.env.NODE_ENV.toUpperCase() !== 'PRODUCTION') {
    console.log('Loading env...');
    let env: string | string[] = fs.readFileSync('./.env').toString();
    if (env.includes('\r')) {
        env = env.split('\r\n');
    } else {
        env = env.split('\n');
    }
    env.forEach(variable => {
        const envSplit = variable.split('=');
        const envKey = envSplit.shift().replace(/^"||^'|'$/g, '');
        const envValue = envSplit
            .splice(0, envSplit.length)
            .join('=')
            .replace(/^"|"$|^'|'$/g, '');
        if (envKey.length && envValue.length) process.env[envKey] = envValue;
    });
}

/* Loop through arguments for log level enum and set as minimum log level if a match is found */
process.argv.forEach(arg => {
    if (Object.keys(LEVELS).includes(arg)) process.env.DEFAULTLOGLEVEL = arg;
});

/* Initialize app */
init();
