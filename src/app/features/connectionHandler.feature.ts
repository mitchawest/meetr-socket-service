import SessionService from '@service/session.service';
import logger from '@service/logger.service';

import SocketMessage from '@model/message.model';
import IdentifiedConnection from '@model/connection.model';

const sessionService = new SessionService();

const sessionHandler = (connection: IdentifiedConnection) => {
    try {
        /* Parse params userId and sessionId from connection url if present. If no userId connection id is used. */
        const params: string[] = connection.url.split('?')[1] ? connection.url.split('?')[1].split('&') : [];
        connection.userId = params.find(param => param.includes('userId')) ? params.find(param => param.includes('userId')).split('=')[1] : connection.id;
        connection.sessionId = params.find(param => param.includes('sessionId')) ? params.find(param => param.includes('sessionId')).split('=')[1] : null;

        /* Join or create session and add to session service array. Return message to client with session ID*/
        sessionService.joinOrCreateSession(connection);
        connection.write(new SocketMessage('server', connection.sessionId).toString());
        logger.info(`Connection established | Session: ${connection.sessionId} | Connection: ${connection.id}`);
        logger.debug(`User: ${connection.userId}`);

        /* Add listener to handle messages from clients */
        connection.on('data', data => sendMessage(data, connection));

        /* Send messages to other session users that user has joined. */
        sendMessage(`User ${connection.userId} has joined the session.`, connection);
    } catch (err) {
        logger.error(`Connection error: ${err}`);
    }
};

/* Sends message to all session connections except sending connection */
const sendMessage = (data: string, sendingConnection: IdentifiedConnection) => {
    logger.info(`Message sent | Session: ${sendingConnection.sessionId} | Connection: ${sendingConnection.id}`);
    logger.debug(`User: ${sendingConnection.userId}`);
    logger.debug(data);
    sessionService
        .getSessionConnections(sendingConnection.sessionId)
        .filter(sessionConnection => sessionConnection.id !== sendingConnection.id)
        .map(sessionConnection => sessionConnection.write(new SocketMessage(sendingConnection.userId, data).toString()));
};

export default sessionHandler;
