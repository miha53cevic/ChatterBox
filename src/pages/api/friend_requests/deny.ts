import { createHandler, UnauthorizedException, Req, Post, HttpCode, ValidationPipe, Body } from 'next-api-decorators';
import type { NextApiRequest } from "next";
import { IsNotEmpty } from 'class-validator';

import withSessionRoute from "../../../lib/withSessionRoute";
import { prisma } from '../../../server/db';

class DenyFriendRequestDTO {
    @IsNotEmpty()
    idPosiljatelj!: number;
};

class DenyFriendRequest {
    @Post()
    @HttpCode(201)
    public async acceptNewFriendRequest(@Req() req: NextApiRequest, @Body(ValidationPipe) dto: DenyFriendRequestDTO) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');

        const friendRequest = await prisma.zahtjevzaprijateljstvo.update({
            data: {
                nazivstatus: 'denied',
            },
            where: {
                idposiljatelj_idprimatelj: {
                    idposiljatelj: dto.idPosiljatelj,
                    idprimatelj: req.session.korisnik.idkorisnik
                }
            }
        });

        return friendRequest;
    }
}

export default withSessionRoute(createHandler(DenyFriendRequest));