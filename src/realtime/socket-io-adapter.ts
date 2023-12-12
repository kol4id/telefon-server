import { INestApplicationContext, UnauthorizedException } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { Server, ServerOptions, Socket } from "socket.io";
import { TokenService } from "src/token/token.service";

export type SocketWithAuth = Socket & {userId: string};

export class SocketIOAdapter extends IoAdapter{
    constructor(private app: INestApplicationContext) {
        super(app);
    }

    createIOServer(port: number, options?: any) {
        const clientPort = process.env.CLIENT_PORT;

        const cors = {
            origin: [
                `http://localhost:${clientPort}`,
                new RegExp(`/^http:\/\/192\.168\.1\.([1-9]|[1-9]\d):${clientPort}$/`),
            ]
        }

        const optionsWithCors: ServerOptions = {
            ...options,
            cors,
        };

        const tokenService = this.app.get(TokenService);

        const server: Server =  super.createIOServer(port, optionsWithCors)
        server.use(this.createTokenMiddleware(tokenService))
        return server
    }    

    createTokenMiddleware = 
        (tokenService: TokenService) =>
            async (socket: SocketWithAuth, next) =>{
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

                if (!token){
                    next(new Error('Sockets: "Authorization" header is empty!'));
                }

                try {
                    const parsedToken = token.split(' ')[1];
                    const data =  await tokenService.VerifyTokenAsync(parsedToken, 'access');
                    socket.userId = String(data.id)
                    next();
                } catch (error) {
                    next(new Error('Unauthorized, '))
                }
            }

}