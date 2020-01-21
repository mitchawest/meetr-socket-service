import ws from 'ws';
import amqplib from 'amqplib';
import sessionService from '@service/session.service';
import Session from '@model/session.model';

class MessageService {
    public messages: amqplib.ConsumeMessage[] = [];
    public sendMessage = (message: amqplib.ConsumeMessage) => {
        const sessionUpdate: Session = JSON.parse(message.content.toString());
        if (!sessionUpdate.members || !sessionUpdate.members.length) return;
        const memberConnectionIds = sessionUpdate.members.map(member => member.connectionId);
        sessionService.connections.filter(connection => memberConnectionIds.includes(connection.id)).map(connection => connection.connection.send(JSON.stringify(sessionUpdate)));
    };
}

const messageService = new MessageService();

export default messageService;
