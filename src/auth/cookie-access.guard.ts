import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { UserRepository } from "src/mongo/mongo-user.service";
import { TokenService } from "src/token/token.service";


@Injectable()
export class CookieAccessGuard implements CanActivate{
    constructor(
        private tokenService: TokenService,
        private mongoUserService: UserRepository,
    ){}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const accessCookie = request.cookies['accessToken'];

        if (!accessCookie){
            throw new UnauthorizedException('AccessToken: accessToken cookie is empty');
        }

        let unsignCookie: any;
        try {
            unsignCookie = request.unsignCookie(accessCookie);
        } catch (error: unknown){
            throw new UnauthorizedException('AccessToken: accessToken cookie is not valid, try /refresh to refresh access token')
        }

        const data = await this.tokenService.VerifyTokenAsync(unsignCookie.value, 'access');
        const user = await this.mongoUserService.findById(data.id);

        if (!user){
            throw new UnauthorizedException('AccessToken: There is no such user') 
        }

        request.user = user

        return true;
    }
}