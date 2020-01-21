import uuidv4 from 'uuid/v4';
import ws from 'ws';
import connectionService from '@service/session.service';
import logger from '@service/logger.service';
import Session from '@model/session.model';

const connectionHandler = (connection: ws) => {
    const id = uuidv4();
    connectionService.addConnection(id, connection);
    const message: Session['messages'][0] = { fromId: 'server', sent: Number(new Date().toTimeString()), subject: 'connectionId', content: id };
    connection.send(JSON.stringify(message));
    connection.on('error', err => logger.error(`Connection error: ${err}`));
};

export default connectionHandler;
