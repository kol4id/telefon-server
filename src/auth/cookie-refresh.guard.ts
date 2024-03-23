import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { UserRepository } from "src/mongo/mongo-user.service";
import { TokenService } from "src/token/token.service";


@Injectable()
export class CookieRefreshGuard implements CanActivate{
    constructor(
        private tokenService: TokenService,
        private mongoUserService: UserRepository,
    ){}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const refreshCookie = request.cookies['refreshToken'];

        if (!refreshCookie){
            throw new UnauthorizedException('RefreshToken: refreshToken cookie is empty');
        }

        let unsignCookie: any;
        try {
            unsignCookie = request.unsignCookie(refreshCookie);
        } catch (error: unknown) {
            throw new UnauthorizedException('RefreshToken: refreshToken cookie is not valid');    
        }
        const data = await this.tokenService.VerifyTokenAsync(unsignCookie.value, 'refresh');
        const user = await this.mongoUserService.findById(data.id);

        if (!user){
            throw new UnauthorizedException('RefreshToken: There is no such user') 
        }

        request.user = user
        
        return true;
    }
}
