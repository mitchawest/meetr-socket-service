import { Connection } from 'sockjs';
import SessionService from '@service/session.service';
import logger from '@service/logger.service';

import SocketMessage from '@model/message.model';

const sessionService = new SessionService();

const sessionHandler = (connection: Connection) => {
    try {
        /* Parse params userId and sessionId from connection url if present. If no userId connection id is used. */
        const params: string[] = connection.url.split('?')[1] ? connection.url.split('?')[1].split('&') : [];
        const userId: string = params.find(param => param.includes('userId')) ? params.find(param => param.includes('userId')).split('=')[1] : connection.id;
        let sessionId: string = params.find(param => param.includes('sessionId')) ? params.find(param => param.includes('sessionId')).split('=')[1] : null;

        /* Send message to session users on connection close */
        connection.on('close', () => {
            sessionService
                .getSessionConnections(sessionId)
                .map(sessionConnection => sessionConnection.connection.write(new SocketMessage(userId, 'message', `User ${userId} has disconnected.`).toString()));
            logger.info(`Disconnected | User: ${userId} | Session: ${sessionId} | Connection: ${connection.id}`);
        });

        /* If session id parameter present, join existing session and message other session connections that user has joined. */
        if (sessionId) {
            sessionId = sessionService.joinOrCreateSession(sessionId, connection, userId);
            sessionService.getSessionConnections(sessionId).map(sessionConnection => sessionConnection.connection.write(new SocketMessage(userId, 'message', `User ${userId} has joined.`).toString()));
            connection.write(new SocketMessage('server', 'session', sessionId).toString());
            logger.info(`Connection established | User: ${userId} | Session: ${sessionId} | Connection: ${connection.id}`);
            return;
        }

        /* If no session sent, start new session and message id back to user */
        sessionId = sessionService.createSession(connection, userId);
        connection.write(new SocketMessage('server', 'session', sessionId).toString());
        logger.info(`Connection established | User: ${userId} | Session: ${sessionId} | Connection: ${connection.id}`);
        return;
    } catch (err) {
        logger.error(`Connection error: ${err}`);
    }
};

export default sessionHandler;
