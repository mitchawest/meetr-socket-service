interface SessionMember {
    id: string;
    nickName?: string;
    connectionId: string;
    lat?: number;
    long?: number;
}

interface SessionMessage {
    fromId: string;
    fromNickName?: string;
    sent: number;
    subject: string;
    content: string;
}

export default interface Session {
    id: string;
    owner: string;
    ownerNickName?: string;
    created: number;
    lastActive: number;
    members: SessionMember[];
    messages: SessionMessage[];
    active: boolean;
}
