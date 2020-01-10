import uuidv4 from 'uuid/v4';
import IdentifiedConnection from '@app/models/connection.model';

export default class SessionService {
    private connections: IdentifiedConnection[] = [];
    private createSession = (connection: IdentifiedConnection) => {
        connection.sessionId = uuidv4();
        this.connections.push(connection);
    };
    joinOrCreateSession = (newConnection: IdentifiedConnection) => {
        if (newConnection.sessionId && this.connections.find(connection => connection.sessionId === newConnection.sessionId)) {
            this.connections.push(newConnection);
            return;
        }
        this.createSession(newConnection);
    };
    getSessionConnections = (sessionId: string) => {
        return this.connections.filter(connection => connection.sessionId === sessionId);
    };
}
