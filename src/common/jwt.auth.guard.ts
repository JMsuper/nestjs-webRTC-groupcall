import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { jwtConstants } from "./constants";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../auth/auth-meta";
import { AccessTokenPayload } from "./payload";

@Injectable()
export class JwtAuthGuard implements CanActivate{
    constructor(private jwtService: JwtService, private reflector: Reflector){}

    async canActivate(context: ExecutionContext): Promise<boolean>{
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY,[
            context.getHandler(),
            context.getClass()
        ]);

        if(isPublic){
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if(!token){
            throw new UnauthorizedException();
        }

        try{
            const payload: AccessTokenPayload = await this.jwtService.verifyAsync(
                token,
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

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
    
}