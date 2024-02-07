import { OmitType } from "@nestjs/mapped-types";

export class AccessTokenPayload{
    userId: number;
    email: string;
}

export class RefreshTokenPayload extends OmitType(AccessTokenPayload,['email']){}