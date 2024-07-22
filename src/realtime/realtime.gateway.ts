import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Redis } from 'ioredis';
import { Server, Socket } from 'socket.io';
import { ServerToClientEvents, ServerToClientMessageType } from './events';
import { SocketWithAuth } from './socket-io-adapter';
import { ServiceUnavailableException } from '@nestjs/common';
import { UserRepository } from 'src/mongo/mongo-user.service';
import { MessageDto } from 'src/messages/dto/message.dto';
import { RealtimeService } from './realtime.service';

@WebSocketGateway({cors: true})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit{
  constructor(
    private mongoUserService: UserRepository,
    private realtimeService: RealtimeService,
  ){}

  private readonly redisClient = new Redis({
    port: 6000,
  });
  
  @WebSocketServer()
  server: Server<any, ServerToClientEvents>;

  afterInit(client: Socket){
  }

  async handleConnection(client: SocketWithAuth){
    this.addUser(client.userId, client.id);
    await this.joinRooms(client);
    this.server.to(client.id).emit('personalMessage', 'Hiiii')
  }

  async handleDisconnect(client: SocketWithAuth){
    const userId = await this.redisClient.get(client.id);
    this.realtimeService.updateUserLastLogin(userId);
    
    this.server.to(client.id).emit('personalMessage', 'By By');
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: { room: string, message: string }): Promise<void>{
    client.to(payload.room).emit('messageFromRoom', payload.message);
  }

  @SubscribeMessage('messagesRead')
  async handleMessageRead(client: Socket, payload: MessageDto[]): Promise<void>{

    const messages = await this.realtimeService.setMessagesRead(await this.getUser(client.id) , payload, {group: true});
    Object.entries(messages).forEach(([key, value]) => {
      this.sendToRoom(key, "messagesRead", value)
    });
  }

  async addUser(userId: string, socketId: string): Promise<boolean>{
    try {
      await this.redisClient.set(socketId, userId);
    } catch (error) {
      throw new ServiceUnavailableException("Database error");
    }
    
    return true
  }

  async getUser(clientId: string): Promise<string> {
    return await this.redisClient.get(clientId);
  }

  async joinRooms(client: SocketWithAuth): Promise<void>{
    // const userId = await this.getUser(client.id);
    const user = await this.mongoUserService.findById(client.userId);
    for (const room of user.subscriptions){
      client.join(room);
    }
  }

  async sendToRoom(roomName: string, event: ServerToClientMessageType, message: any){
    this.server.in(roomName).emit(event, message);
  }
}
