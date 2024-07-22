import { MessageDto } from "src/messages/dto/message.dto";

export interface ServerToClientEvents {
    personalMessage: (payload: string) => void;
    messagesRead: (payload: MessageDto) => void;
    messageCreate: (payload: MessageDto) => void;
}

export interface ClientToServerEvents {
    personalMessage: (payload: string) => void;
    messagesRead: (payload: MessageDto) => void;
}

export type ServerToClientMessageType = 
    | 'messageCreate'
    | 'messagesRead'
    | 'personalMessage';

export type ClientToServerMessageType = 
    | 'messagesRead'
    | 'personalMessage';
