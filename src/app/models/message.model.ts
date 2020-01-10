export default class SocketMessage {
    constructor(public sender: string, public message: string | object) {}

    toString = () => {
        return JSON.stringify({ sender: this.sender, message: this.message });
    };
}
