import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Redis } from 'ioredis';
import { Server, Socket } from 'socket.io';
import { ServerToClientEvent } from './events';
import { SocketWithAuth } from './socket-io-adapter';
import { ServiceUnavailableException } from '@nestjs/common';
import { MongoUserService } from 'src/mongo/mongo-user.service';

@WebSocketGateway()
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit{
  constructor(private mongoUserService: MongoUserService){}

  @WebSocketServer()
  server: Server<any, ServerToClientEvent>;

  afterInit(client: Socket){
    console.log('started')
  }

  private readonly redisClient = new Redis({
    port: 6000,
  });

  async handleConnection(client: SocketWithAuth){

    console.log(`Client connected ${client.id}`)
    this.addUser(client.userId, client.id);
    await this.joinRooms(client);
    this.server.to(client.id).emit('personalMessage', 'Hiiii')
  }

  handleDisconnect(client: SocketWithAuth){
    console.log(`Client disconected ${client.id}`)
    this.server.to(client.id).emit('personalMessage', 'By By')
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: { room: string, message: string }): void {
    console.log(`Recived message from ${client.id}: ${payload}`)
    // this.server.to(client.id).emit('personalMessage', 'Privet!')
    // console.log(client.rooms)
    client.to(payload.room).emit('messageFromRoom', payload.message);
    //this.server.emit('personalMessage', payload)
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
    console.log(user)
    for (const room of user.subscriptions){
      client.join(room);
    }
  }
}
