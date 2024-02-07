import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { jwtConstants } from "./constants";
import { Reflector } from "@nestjs/core";
import { RefreshTokenPayload } from "./payload";

@Injectable()
export class RefreshAuthGuard implements CanActivate{
    constructor(private jwtService: JwtService){}

    async canActivate(context: ExecutionContext): Promise<boolean>{
        const request = context.switchToHttp().getRequest();
        const refreshToken = this.extractTokenFromHeader(request);

        if(!refreshToken){
            throw new UnauthorizedException();
        }

        try{
            const payload: RefreshTokenPayload = await this.jwtService.verifyAsync(
                refreshToken,
                {
                    secret: jwtConstants.secret
                }
            );

            request['userId'] = payload.userId;
        }catch{
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string {
        return request.cookies['refreshToken'];
    }
    
}