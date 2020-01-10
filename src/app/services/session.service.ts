import { Connection } from 'sockjs';
import uuidv4 from 'uuid/v4';

interface SessionConnections {
    [key: string]: { userId: string; connection: Connection }[];
}

export default class SessionService {
    sessions: SessionConnections = {};
    createSession = (connection: Connection, userId: string) => {
        const newSessionId = uuidv4();
        this.sessions[newSessionId] = [{ userId: userId, connection: connection }];
        return newSessionId;
    };
    joinOrCreateSession = (sessionId: string, connection: Connection, userId: string) => {
        if (this.sessions[sessionId]) {
            this.sessions[sessionId].push({ userId: userId, connection: connection });
            return sessionId;
        }
        return this.createSession(connection, userId);
    };
    getSessionConnections = (sessionId: string) => {
        return this.sessions[sessionId];
    };
}
