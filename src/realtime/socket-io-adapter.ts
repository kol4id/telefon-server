import { INestApplicationContext, UnauthorizedException} from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { Server, ServerOptions, Socket } from "socket.io";
import { TokenService } from "src/token/token.service";
import { UserService } from "src/user/user.service";

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
        const userService = this.app.get(UserService);

        const server: Server =  super.createIOServer(port, optionsWithCors)
        server.use(this.createTokenMiddleware(tokenService, userService))
        return server
    }    

    createTokenMiddleware = 
        (tokenService: TokenService, userService: UserService) =>
            async (socket: SocketWithAuth, next) =>{
                try {
                    const headers = socket.handshake.headers;
                    let accessToken: string = '';

                    if (headers.cookie){
                        const cookies = headers.cookie.split(';').reduce((acc: Record<string, string>, cookie) => {
                            const [name, value] = cookie.trim().split('=');
                            acc[name] = value;
                            return acc;
                        }, {});

                        const tokenSigned = cookies['accessToken'];
                        const lastDotIndex = tokenSigned.lastIndexOf('.');
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
                    const user = await userService.getUser((String(data.id)));
                    
                    if (!user){
                        throw new UnauthorizedException('AccessToken: There is no such user') 
                    }

                    socket.userId = data.id;
                    next();
                } catch (error) {
                    next(new Error('Unauthorized, '))
                }
            }

}