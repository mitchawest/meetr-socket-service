import http from 'http';
import sockjs from 'sockjs';

import logger from '@service/logger.service';
import { LEVELS, COLORS } from '@util/enums';
import sessionHandler from './features/connectionHandler.feature';

const init = async () => {
    try {
        /* Initialize logger with log level enumeration */
        logger.init(LEVELS, COLORS);

        /* Create socket server */
        const socket = sockjs.createServer({
            websocket: true,
            log: (severity: string, message: string) => {
                logger[severity](message);
            }
        });

        /* Add listeners to connection event */
        socket.on('connection', sessionHandler);

        /* Start socket server */
        const port = process.env.RUNTIME_PORT || 8000;
        const server = http.createServer();
        socket.installHandlers(server);
        server.listen(port, () => logger.info(`${process.env.NAMESPACE} server listening on port: ${port}`));

        return server;
    } catch (err) {
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
