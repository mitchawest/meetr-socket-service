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
        logger.init(LEVELS, COLORS);

        /* Create http server */
        const server = http.createServer();

        /* Create socket server */
        const wsServer = new ws.Server({
            server: server
        });

        /* Get express app */
        const app = await expressInit();

        /* Init mongo connection */
        await mongoService.init();

        /* Init amqp connection */
        await amqpService.init();

        server.on('request', app);
        wsServer.on('connection', connectionHandler);
        wsServer.on('error', err => {
            throw err;
        });

        /* Listen on configured port */
        const port = process.env.RUNTIME_PORT || 80;
        server.listen(port, () => logger.info(`${process.env.NAMESPACE} server listening on port: ${port}`));

        return server;
    } catch (err) {
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
