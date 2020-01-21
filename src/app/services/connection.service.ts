import ws from 'ws';

/* Stores socket connections and identifiers for messaging purposes */
class ConnectionService {
    public connections: { id: string; connection: ws }[] = [];
    public addConnection = (id: string, connection: ws) => {
        this.connections.push({ id: id, connection: connection });
    };
    public removeConnection = (id: string) => {
        this.connections.splice(
            this.connections.findIndex(connection => connection.id === id),
            1
        );
    };
}

const connectionService = new ConnectionService();

export default connectionService;
