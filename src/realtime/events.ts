import { ChannelDto } from "src/channels/dto/channel.dto";
import { ChatDto } from "src/chats/dto/chat.dto";
import { MessageDto } from "src/messages/dto/message.dto";
import { UserDto } from "src/user/dto/user.dto";

export interface ServerToClientEvents {
    personalMessage: (payload: string) => void;
    messagesRead: (payload: MessageDto) => void;
    messageCreate: (payload: {message: MessageDto, chat: ChatDto}) => void;
    updateUser: (payload: UserDto) => void;
    channelSubscribe: (payload: ChannelDto) => void;
}

export interface ClientToServerEvents {
    personalMessage: (payload: string) => void;
    messagesRead: (payload: MessageDto) => void;
}

export type ServerToClientMessageType = 
    | 'messageCreate'
    | 'messagesRead'
    | 'personalMessage'
    | 'updateUser';

export type ClientToServerMessageType = 
    | 'messagesRead'
    | 'personalMessage';
