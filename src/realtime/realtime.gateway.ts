import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Redis } from 'ioredis';
import { Server, Socket } from 'socket.io';
import { ServerToClientEvents, ServerToClientMessageType } from './events';
import { SocketWithAuth } from './socket-io-adapter';
import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { UserRepository } from 'src/mongo/mongo-user.service';
import { MessageDto } from 'src/messages/dto/message.dto';
import { RealtimeService } from './realtime.service';
import { CreateMessageDto } from 'src/messages/dto/create-message.dto';
import { MessagesService } from 'src/messages/messages.service';
import { UserDto } from 'src/user/dto/user.dto';
import { ChannelRepository } from 'src/mongo/mongo-channel.service';
import { ChatRepository } from 'src/mongo/mongo-chat.service';
import { ChatDto } from 'src/chats/dto/chat.dto';
import { ChannelDto } from 'src/channels/dto/channel.dto';
import { MediaService } from 'src/media/media.service';

@WebSocketGateway({ cors: true })
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  constructor(
    private userRepository: UserRepository,
    private chatRepository: ChatRepository,
    private channelRepository: ChannelRepository,
    private messageService: MessagesService,
    private realtimeService: RealtimeService,
    private mediaService: MediaService
  ) {}
  private logger = new Logger(RealtimeGateway.name);

  private readonly redisClient = new Redis({
    port: 6379,
  });
  
  @WebSocketServer()
  server: Server<any, ServerToClientEvents>;

  afterInit(client: Socket) {
    // This method is called when the WebSocket server is initialized.
  }
 
  async handleConnection(client: SocketWithAuth){
    await this.addUser(client.userId, client.id);
    await this.joinRooms(client);
    this.logger.debug(client.id);
    this.server.to(client.id).emit('personalMessage', 'Hiiii');
  }

  async handleDisconnect(client: SocketWithAuth){
    const userId = await this.redisClient.get(client.id);
    if (userId) {
      this.realtimeService.updateUserLastLogin(userId);
      this.server.to(client.id).emit('personalMessage', 'By By');
    }
    this.removeUser(client.id);
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: { room: string, message: string }): Promise<void> {
    client.to(payload.room).emit('messageFromRoom', payload.message);
  }
  @SubscribeMessage('messageCreate')
  async handleMessageCreate(client: Socket, payload: CreateMessageDto): Promise<void> {
    const userId = await this.getUser(client.id);
    let user = await this.userRepository.findById(userId);

    if (user.subscriptions == undefined || !user.subscriptions.includes(payload.channelId)){
      await this.handleSubscribe(user, payload.channelId);
    }

    let chat: ChatDto;
    const channel = await this.channelRepository.findById(payload.channelId)
    switch (channel.channelType){
      case 'user':
        chat = await this.chatRepository.findDMChat([channel.id, user.personalChannel]);
        break;
      default: 
        chat = await this.chatRepository.findByChannel(channel.id);
    }
  
    this.logger.debug(chat);
    let media: string[];
    if (payload.hasMedia){
      const buffers = await this.convertFilesToBuffers(payload.media);
      media = await Promise.all(buffers.map(async buffer => this.mediaService.create(buffer)));
    }

    const messageData = {
      chatId: chat.id,
      content: payload.content,
      hasMedia: payload.hasMedia,
      mediaUrls: media
    }

    const message = await this.messageService.create(messageData, user);
    const data = {message, chat};
    this.sendToRoom(message.chatId, "messageCreate", data);
    this.logger.debug(`message created, client: ${client.id}, user ${userId} \n${JSON.stringify(message)}`);
  }

  @SubscribeMessage('messagesRead')
  async handleMessageRead(client: Socket, payload: MessageDto[]): Promise<void> {
    this.logger.debug('messageRead')
    this.logger.debug(payload)
    const userId = await this.getUser(client.id);
    if (!userId) {
      throw new ServiceUnavailableException("User not found");
    }
    const messages = await this.realtimeService.setMessagesRead(userId, payload, { group: true });
    Object.entries(messages).forEach(([key, value]) => {
      this.sendToRoom(key, "messagesRead", value);
    });
  }

  async addUser(userId: string, socketId: string): Promise<boolean> {
    try {
      await this.redisClient.set(socketId, userId);
      await this.redisClient.set(userId, socketId);
    } catch (error) {
      this.logger.error("Database error", error);
      throw new ServiceUnavailableException("Database error");
    }
    return true;
  }

  async removeUser(socketId: string): Promise<void>{
    try{
      const userId = await this.redisClient.get(socketId);
      this.redisClient.del(socketId);
      this.redisClient.del(userId);
    } catch (error) {
      this.logger.error("Database error", error);
      throw new ServiceUnavailableException("Database error");
    }
  }

  async getUser(clientId: string): Promise<string>{
    const userId = await this.redisClient.get(clientId);
    if (!userId) {
      throw new ServiceUnavailableException("User not found");
    }
    return userId;
  }

  async getClientId(userId: string): Promise<string>{
    const clientId = await this.redisClient.get(userId);
    return clientId;
  }

  async joinRooms(client: Socket): Promise<void>{
    const userId = await this.getUser(client.id);
    const subs = await this.chatRepository.findByParticipant(userId);
    for (const sub of subs){
      client.join(sub.id);
    }
  }

  async sendToRoom(roomName: string, event: ServerToClientMessageType, message: any){
    this.server.in(roomName).emit(event, message);
  }

  async handleSubscribe(user: UserDto, channelId: string){
    const channel = await this.channelRepository.findById(channelId);
    const initiatorChannel = await this.channelRepository.findById(user.personalChannel);
    const joinAndUpdateUser = async(userId: string, chatId: string, channel: ChannelDto) =>{
      const user = await this.userRepository.findById(userId);
      const clientId = await this.getClientId(user.id);
      const socket = this.server.sockets.sockets.get(clientId);
      if (!socket) return
      socket.join(chatId);
      socket.emit('updateUser', user);
      socket.emit('channelSubscribe', channel);
    }

    if (channel.channelType == 'user'){
      const newChat = await this.realtimeService.userSubscribeDm(user, channel);
      joinAndUpdateUser(user.id, newChat.id, channel);
      joinAndUpdateUser(channel.creatorId, newChat.id, initiatorChannel);
    } else {
      const chat = await this.realtimeService.userSubscribeChannel(user, channel);
      joinAndUpdateUser(user.id, chat.id, channel);
    }
  }

  private convertFilesToBuffers = (files: ArrayBuffer[]): Promise<Buffer[]> => {
    return Promise.all(
      files.map(file => {
        return new Promise<Buffer>((resolve, reject) => {
          resolve(Buffer.from(new Uint8Array(file)))
        });
      })
    );
  };
}




