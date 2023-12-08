import { UseGuards } from '@nestjs/common';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Redis } from 'ioredis';
import { Server, Socket } from 'socket.io';
import { WSJwtGuard } from 'src/auth/web-sockets.guard';

@WebSocketGateway()
@UseGuards(WSJwtGuard)
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect{
  @WebSocketServer()
  server: Server;

  afterInit(client: Socket){
    client.use((req, next) => {

    })
  }

  private readonly redisClient = new Redis({
    port: 6000,
  });

  handleConnection(client: Socket){

    console.log(`Client connected ${client.id}`)
    this.server.to(client.id).emit('personalMessage', 'Hiiii')
    const cookieHeader = client.handshake.headers.cookie;
    // console.log(client)

  }

  handleDisconnect(client: Socket){
    console.log(`Client disconected ${client.id}`)
    this.server.to(client.id).emit('personalMessage', 'By By')
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): void {
    console.log(`Recived message from ${client.id}: ${payload}`)
    this.server.to(client.id).emit('personalMessage', 'Privet!')
    this.server.emit('personalMessage', payload)
  }
}
