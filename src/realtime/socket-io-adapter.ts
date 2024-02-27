import fastifyCookie from "@fastify/cookie";
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
        const clientPort = process.env.FRONTEND_URL_DEV;

        //FRONTEND_URL_PROD  FRONTEND_URL_DEV

        const cors = {
            origin: [
                `http://localhost:${clientPort}`,
                new RegExp(`/^http:\/\/192\.168\.1\.([1-9]|[1-9]\d):${clientPort}$/`),
            ],
            methods: ['GET', 'POST'],
            credentials: true,
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
                const tokenSigned = socket.handshake.headers.cookie.split("=")[1].split(";")[0];
                const lastDotIndex = tokenSigned.lastIndexOf('.');
                // Извлекаем подстроку до последней точки
                const accessToken = tokenSigned.substring(tokenSigned.lastIndexOf('=', lastDotIndex - 1) + 1, lastDotIndex);
    
                if (!accessToken){
                    next(new Error('Sockets: "Authorization" header is empty!'));
                }
                try {
                    const data = await tokenService.VerifyTokenAsync(accessToken, 'access');
                    socket.userId = String(data.id)                    
                    next();
                } catch (error) {
                    next(new Error('Unauthorized, '))
                }
            }

}