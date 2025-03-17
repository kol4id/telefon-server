import { ChannelDto } from "src/channels/dto/channel.dto";
import { ChatDto } from "src/chats/dto/chat.dto";
import { MessageDto } from "src/messages/dto/message.dto";
import { UserDto } from "src/user/dto/user.dto";

export interface ServerToClientEvents {
    personalMessage: (payload: string) => void;
    messagesRead: (payload: MessageDto) => void;
    messageCreate: (payload: {message: MessageDto, chat: ChatDto}) => void;
    messageDelete: (payload: boolean) => void;
    updateUser: (payload: UserDto) => void;
    channelSubscribe: (payload: {channel: ChannelDto, chat: ChatDto}) => void;
    channelLeave: (payload: {channel: ChannelDto, chat: ChatDto}) => void;
    userOnlineStatus: (payload: {channelId: string, status: boolean}) => void;
    subsOnlineStatus: (payload: {channelId: string, status: boolean}[]) => void;
}

export interface ClientToServerEvents {
    personalMessage: (payload: string) => void;
    messagesRead: (payload: MessageDto) => void;
    messageDelete: (payload: string) => void;
    userOnlineStatus: (payload: boolean) => void;
}

export type ServerToClientMessageType = 
    | 'messageCreate'
    | 'messagesRead'
    | 'messageDelete'
    | 'personalMessage'
    | 'updateUser'
    | 'channelSubscribe'
    | 'channelLeave'
    | 'userOnlineStatus'
    | 'subsOnlineStatus';

export type ClientToServerMessageType = 
    | 'messagesRead'
    | 'messageDelete'
    | 'personalMessage'
    | 'userOnlineStatus';
