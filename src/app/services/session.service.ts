import ws from 'ws';

class ConnectionService {
    public connections: { id: string; connection: ws }[] = [];
    public addConnection = (id: string, connection: ws) => {
        this.connections.push({ id: id, connection: connection });
    };
}

const connectionService = new ConnectionService();

export default connectionService;
