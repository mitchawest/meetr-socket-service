import sockjs from 'sockjs';

export default interface IdentifiedConnection extends sockjs.Connection {
    sessionId: string;
    userId: string;
}
