import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Socket } from "socket.io";


@Injectable()
export class WSJwtGuard implements CanActivate{
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> {
        if (context.getType() !== 'ws') {
            return true
        }

        const client: Socket = context.switchToWs().getClient();
        const {auth} = client.handshake.headers;

        console.log(auth)
        return false;
    }
}