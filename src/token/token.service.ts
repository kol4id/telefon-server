import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
    constructor(private jwtService: JwtService){}

    async GetTokenAsync(id: string, tokenType: string): Promise<string>{
        let tokenString: string;
        let expiresIn: string;
        switch (tokenType) {
            case 'access':
                tokenString = process.env.JWT_SECRET;
                expiresIn = process.env.JWT_EXPIRED;
                break;
            
            case 'refresh':
                tokenString = process.env.JWT_REFRESH_SECRET
                expiresIn = process.env.JWT_REFRESH_EXPIRED;
                break;
        }

        return await this.jwtService.signAsync(
            {id},
            {
                secret: tokenString,
                expiresIn: expiresIn,
            }
        )
    }

    async VerifyTokenAsync(token: string, tokenType: string): Promise<any>{

        let tokenString: string;
        switch (tokenType) {
            case 'access':
                tokenString = process.env.JWT_SECRET;
                break;
            
            case 'refresh':
                tokenString = process.env.JWT_REFRESH_SECRET
                break;
        }
        let data: any;
        try {
            data = await this.jwtService.verifyAsync(
                token,
                {
                    secret: tokenString,
                }
            )
        } catch (error: unknown) {
            throw new UnauthorizedException(`Your ${tokenType} token is not valid`);
        }
        return data
    }

    async GetTokensAsync(id: string): Promise<{access: string, refresh: string}>{
        const access = await this.GetTokenAsync(id, 'access')
        const refresh = await this.GetTokenAsync(id, 'refresh')
        return {access, refresh}
    }
}
