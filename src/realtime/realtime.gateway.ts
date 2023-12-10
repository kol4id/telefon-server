import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Redis } from 'ioredis';
import { Server, Socket } from 'socket.io';
import { ServerToClientEvent } from './events';
import { SocketWithAuth } from './socket-io-adapter';

@WebSocketGateway()
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit{
  @WebSocketServer()
  server: Server<any, ServerToClientEvent>;

  afterInit(client: Socket){
    // client.use((this.socketMiddleware.SocketAuthMiddleWare() as any))
    console.log('started')
  }

  private readonly redisClient = new Redis({
    port: 6000,
  });

  handleConnection(client: SocketWithAuth){

    console.log(`Client connected ${client.id}`)
    this.server.to(client.id).emit('personalMessage', 'Hiiii')
    const cookieHeader = client.handshake.headers.cookie;
    // console.log(client)

  }

  handleDisconnect(client: SocketWithAuth){
    console.log(`Client disconected ${client.id}`)
    this.server.to(client.id).emit('personalMessage', 'By By')
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): void {
    console.log(`Recived message from ${client.id}: ${payload}`)
    this.server.to(client.id).emit('personalMessage', 'Privet!')
    //this.server.emit('personalMessage', payload)
  }
}
