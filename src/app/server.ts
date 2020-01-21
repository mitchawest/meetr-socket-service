import http from 'http';
import ws from 'ws';

import expressInit from '@root/src/app/express-app';
import logger from '@service/logger.service';
import connectionHandler from '@feature/connectionHandler.feature';
import { COLORS, LEVELS } from '@util/enums';
import mongoService from '@service/mongo.service';
import amqpService from '@service/amqp.service';

const init = async () => {
    try {
        /* Initialize logger */
        console.log('Initializing logger...');
        logger.init(LEVELS, COLORS);

        /* Create http server */
        logger.info('Creating http server...');
        const server = http.createServer();

        /* Create socket server */
        logger.info('Creating websocket...');
        const wsServer = new ws.Server({
            server: server
        });

        /* Get express app */
        logger.info('Initializing express app...');
        const app = await expressInit();

        /* Init mongo connection */
        logger.info('Connecting to mongo...');
        await mongoService.init();

        /* Init amqp connection */
        logger.info('Connecting to message queue...');
        await amqpService.init();

        /* Route http requests to express */
        server.on('request', app);

        /* Use connection handler to process websocket requests */
        wsServer.on('connection', connectionHandler);
        wsServer.on('error', err => {
            throw err;
        });

        /* Listen on configured port */
        const port = process.env.RUNTIME_PORT || 80;
        server.listen(port, () => logger.info(`${process.env.NAMESPACE} server listening on port: ${port}`));

        /* Cleans up queue on process exit */
        const exitHandler = async (options: any, exitCode: number) => {
            await amqpService.close();
            if (options.cleanup) logger.info('Cleaning processes');
            if (exitCode || exitCode === 0) logger.info(`Exit code: ${exitCode}`);
            if (options.exit) process.exit();
        };
        /* Cleanup when process closes */
        process.on('exit', exitHandler.bind(null, { cleanup: true }));
        /* Cleanup on ctrl+c */
        process.on('SIGINT', exitHandler.bind(null, { exit: true }));
        // catches "kill pid" (for example: nodemon restart)
        process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
        process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));
        //catches uncaught exceptions
        process.on('uncaughtException', exitHandler.bind(null, { exit: true }));

        return server;
    } catch (err) {
        /* If queue initialized, delete queue */
        await amqpService.close();
        if (logger.debug) {
            logger.debug(err);
        } else {
            if (process.env.DEFAULTLOGLEVEL) console.log(err);
        }
        if (logger.critical) {
            logger.critical(`Failed to run. Error: ${err}. Stopping node process.`);
        } else {
            console.log(`Failed to run. Error: ${err}. Stopping node process.`);
        }
        setTimeout(() => process.exit(1), 5000);
    }
};

export default init;
