import ws from 'ws';
import amqplib from 'amqplib';
import connectionService from '@service/connection.service';
import Session from '@model/session.model';
import logger from '@service/logger.service';

/* Gets active connections from connection service, filters by connection ids in session update message, and sends*/
class SessionMessageService {
    public messages: amqplib.ConsumeMessage[] = [];
    public sendMessage = (message: amqplib.ConsumeMessage) => {
        const sessionUpdate: Session = JSON.parse(message.content.toString());
        logger.debug(`Session message received: ${JSON.stringify(sessionUpdate)}`);
        if (!sessionUpdate.members || !sessionUpdate.members.length) return;
        const memberConnectionIds = sessionUpdate.members.map(member => member.connectionId);
        connectionService.connections.filter(connection => memberConnectionIds.includes(connection.id)).map(connection => connection.connection.send(JSON.stringify(sessionUpdate)));
    };
}

const sessionMessageService = new SessionMessageService();

export default sessionMessageService;
