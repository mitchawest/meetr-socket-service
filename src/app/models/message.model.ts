export default class SocketMessage {
    constructor(public sender: string, public contentType: 'session' | 'message' | 'location', public message: string | { lat: string; long: string }) {}

    toString = () => {
        return JSON.stringify({ sender: this.sender, contentType: this.contentType, message: this.message });
    };
}
