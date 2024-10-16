import { INestApplicationContext} from "@nestjs/common";
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

        // [process.env.FRONTEND_URL_PROD, process.env.FRONTEND_URL_DEV]
        const cors = {
            origin: '*',
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
                try {
                    const headers = socket.handshake.headers;
                    let accessToken: string = '';

                    if (headers.cookie){
                        const tokenSigned = headers.cookie.split("=")[1].split(";")[0];
                        const lastDotIndex = tokenSigned.lastIndexOf('.');
                        // Извлекаем подстроку до последней точки
                        accessToken = tokenSigned.substring(tokenSigned.lastIndexOf('=', lastDotIndex - 1) + 1, lastDotIndex);        
                    } else {
                        if(headers.authorization.startsWith("Bearer ")){
                            accessToken = headers.authorization.substring(7, headers.authorization.length);
                        }
                    }

                    if (!accessToken){
                        next(new Error('Sockets: "Authorization" header is empty!'));
                    }

                    const data = await tokenService.VerifyTokenAsync(accessToken, 'access');
                    socket.userId = String(data.id)                    
                    next();
                } catch (error) {
                    next(new Error('Unauthorized, '))
                }
            }

}