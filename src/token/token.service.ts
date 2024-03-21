import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

type token = {
    secret: string,
    expiresIn: string,
}

@Injectable()
export class TokenService {
    constructor(private jwtService: JwtService){}

    async GetTokenAsync(id: string, tokenType: string): Promise<string>{
        const config = this.GetTokenConfig(tokenType);
        return await this.jwtService.signAsync({id}, config);
    }

    async VerifyTokenAsync(token: string, tokenType: string): Promise<any>{
        const config = this.GetTokenConfig(tokenType);
        let data: any;
        try {
            data = await this.jwtService.verifyAsync(token, config)
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

    private GetTokenConfig(tokenType: string): token{
        const config: token = this.tokenConfigs[tokenType];
        if(!config){
            throw new Error(`Invalid token type: ${tokenType}`);
        }
        return config;
    }

    private tokenConfigs = {
        access: {
            secret: process.env.JWT_SECRET,
            expiresIn: process.env.JWT_EXPIRED,
        },
        refresh: {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: process.env.JWT_REFRESH_EXPIRED,
        }
    };

}
