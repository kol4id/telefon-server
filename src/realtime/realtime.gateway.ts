import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ServerToClientEvents, ServerToClientMessageType } from './events';
import { SocketWithAuth } from './socket-io-adapter';
import { Logger } from '@nestjs/common';
import { UserRepository } from 'src/mongo/mongo-user.service';
import { MessageDto } from 'src/messages/dto/message.dto';
import { RealtimeService } from './realtime.service';
import { CreateMessageDto } from 'src/messages/dto/create-message.dto';
import { MessagesService } from 'src/messages/messages.service';
import { RedisService } from 'src/redis/redis.service';
import { ChatsService } from 'src/chats/chats.service';
import { CreateChannelGroupDto } from 'src/channels/dto/create-channel.dto';

@WebSocketGateway({ cors: true })
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  constructor(
    private userRepository: UserRepository,
    private chatService: ChatsService,
    private realtimeService: RealtimeService,
    private redis: RedisService
  ) {}
  private logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server: Server<any, ServerToClientEvents>;

  afterInit(client: Socket) {
    this.realtimeService.setServer(this.server);
  }
 
  async handleConnection(client: SocketWithAuth){
    if (!client.userId) return
    await this.redis.setTwoWay(client.userId, client.id);
    await this.realtimeService.setUserOnlineStatus(client.userId, true);
    await this.joinRooms(client);
    this.realtimeService.sendSubsOnlineStatus(client.userId);
    this.logger.debug(`new socket connection| clientId: ${client.id} || userId: ${client.userId}`);
  }

  async handleDisconnect(client: SocketWithAuth){
    if (!client.userId) return
    await this.realtimeService.setUserOnlineStatus(client.userId, false);
    if (await this.redis.del(client.id, client.userId)) {
      this.logger.debug(`socket disconnect| clientId: ${client.id} || userId: ${client.userId}`);
      return;
    }
    this.logger.error(`socket disconnect FAILURE| clientId: ${client.id} || userId: ${client.userId}`);
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: { room: string, message: string }): Promise<void> {
    client.to(payload.room).emit('messageFromRoom', payload.message);
  }
  
  @SubscribeMessage('messageCreate')
  async handleMessageCreate(client: Socket, payload: CreateMessageDto): Promise<void> {
    this.logger.debug('messageCreate')
    const userId = await this.redis.get(client.id);
    if (!userId) return;

    const message = await this.realtimeService.handleCreateMessage(userId, payload);
    this.logger.debug(`message created, client: ${client.id}, user ${userId} \n${JSON.stringify(message)}`);
  }

  @SubscribeMessage('messagesRead')
  async handleMessageRead(client: Socket, payload: MessageDto[]): Promise<void> {
    this.logger.debug('messageRead')
    const userId = await this.redis.get(client.id);
    if (!userId) return;

    await this.realtimeService.handleMessageRead(userId, payload);
  }

  @SubscribeMessage('messageDelete')
  async handleMessageDelete(client: Socket, payload: string): Promise<void>{
    this.logger.debug('messageDelete');

    const userId = await this.redis.get(client.id);
    await this.realtimeService.deleteMessage(payload, userId);
  }

  @SubscribeMessage('userOnlineStatus')
  async handleUserInactive(client: Socket, payload: boolean): Promise<void>{
    this.logger.debug('userOnlineStatus')
    const userId = await this.redis.get(client.id);
    const user = await this.userRepository.findById(userId);
    this.realtimeService.setUserOnlineStatus(user, payload);
  }

  @SubscribeMessage('channelCreate')
  async handleCreateChannel(client: Socket, payload: CreateChannelGroupDto): Promise<void>{
    const userId = await this.redis.get(client.id);
    this.logger.debug(`createChannel| clientId: ${client.id} || userId: ${userId}`);
    await this.realtimeService.handleCreateChannel(payload, userId);
  }

  @SubscribeMessage('channelLeave')
  async handleChannelLeave(client: Socket, payload: string){
    const userId = await this.redis.get(client.id);
    this.logger.debug(`leaveChannel| clientId: ${client.id} || userId: ${userId} || channelId: ${payload}`);

    this.realtimeService.leaveChannel(userId, payload);
  }

  async joinRooms(client: Socket): Promise<void>{
    const userId = await this.redis.get(client.id);
    this.logger.debug(`joinrooms| clientId: ${client.id} || userId: ${userId}`);

    const subs = await this.chatService.getForUser(userId)
    client.join(subs.map(sub => sub.id))
    // subs.forEach(sub => client.join(sub.id));
  }

  async sendToRoom(roomName: string, event: ServerToClientMessageType, message: any){
    this.server.in(roomName).emit(event, message);
  }
}




