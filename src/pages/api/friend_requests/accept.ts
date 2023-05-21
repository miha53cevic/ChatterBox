import { createHandler, UnauthorizedException, Req, Post, HttpCode, ValidationPipe, Body } from 'next-api-decorators';
import type { NextApiRequest } from "next";
import { IsNotEmpty } from 'class-validator';

import withSessionRoute from "../../../lib/withSessionRoute";
import { prisma } from '../../../server/db';

class AcceptFriendRequestDTO {
    @IsNotEmpty()
    idPosiljatelj!: number;
};

class AcceptFriendRequest {
    @Post()
    @HttpCode(201)
    public async acceptNewFriendRequest(@Req() req: NextApiRequest, @Body(ValidationPipe) dto: AcceptFriendRequestDTO) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');

        const friendRequest = await prisma.zahtjevzaprijateljstvo.update({
            data: {
                nazivstatus: 'accepted',
                prihvacentimestamp: new Date().toISOString(),
            },
            where: {
                idposiljatelj_idprimatelj: {
                    idposiljatelj: dto.idPosiljatelj,
                    idprimatelj: req.session.korisnik.idkorisnik
                }
            }
        });

        // Add new friend
        const newFriend = await prisma.prijatelji.create({
            data: {
                idkorisnik1: dto.idPosiljatelj,
                idkorisnik2: req.session.korisnik.idkorisnik
            },
        });

        return {
            friendRequest,
            newFriend
        };
    }
}

export default withSessionRoute(createHandler(AcceptFriendRequest));