import {Socket} from 'socket.io'

type SocketIOMiddleWare = {
    (client: Socket, next: (err?: Error) => void);
}

export const SocketAuthMiddleWare = () => {
    // return (client, next) => {
    //     try {

    //     }
    // }
}