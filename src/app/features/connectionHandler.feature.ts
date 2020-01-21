import uuidv4 from 'uuid/v4';
import ws from 'ws';
import connectionService from '@service/connection.service';
import logger from '@service/logger.service';
import Session from '@model/session.model';
import mongoService from '../services/mongo.service';
import amqpService from '../services/amqp.service';

/* On websocket connection, creates connection identifier, stores in connection service, and sends back connection identifier to the socket */
const connectionHandler = (connection: ws) => {
    const id = uuidv4();
    connectionService.addConnection(id, connection);
    logger.info(`Websocket connection created | Id: ${id}`);
    const message: Session['messages'][0] = { fromId: 'server', sent: Number(new Date().toTimeString()), subject: 'connectionId', content: id };
    connection.send(JSON.stringify(message));
    connection.on('error', err => {
        logger.error(`Connection error | Id: ${id} | Error: ${err}`);
        connectionService.removeConnection(id);
        Promise.resolve(removeMemberFromSession(id)).catch(err => logger.error(err));
    });
    connection.on('close', () => {
        logger.info(`Connection closed | Id: ${id}`);
        connectionService.removeConnection(id);
        Promise.resolve(removeMemberFromSession(id)).catch(err => logger.error(err));
    });
};

export default connectionHandler;

const removeMemberFromSession = async (connectionId: string) => {
    const now = new Date().getTime();
    let [session] = await mongoService.get('session', { members: { $elemMatch: { connectionId: connectionId } } });
    if (session) {
        await mongoService.update('session', { id: session.id }, { $pull: { members: { connectionId: connectionId } }, $set: { lastActive: now } });
        const final = await mongoService.get('session', { id: session.id });
        session = final[0];
        logger.info(`Member ${connectionId} removed from session ${session.id}`);
        amqpService.send(session).catch(err => logger.error(err));
        logger.info(`Session update sent to queue.`);
    }
};
