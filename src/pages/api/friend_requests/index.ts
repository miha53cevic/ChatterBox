import { createHandler, Get, UnauthorizedException, Req, Post, HttpCode, ValidationPipe, Body } from 'next-api-decorators';
import type { NextApiRequest } from "next";
import { IsNotEmpty } from 'class-validator';

import withSessionRoute from "../../../lib/withSessionRoute";
import { prisma } from '../../../server/db';

import type { ApiFriendRequests } from '../../../types/apiTypes';

class AddFriendRequestDTO {
    @IsNotEmpty()
    idPrimatelj!: number;

    poruka?: string;
};

class FriendRequestsController {
    @Get()
    public async getUserFriendRequests(@Req() req: NextApiRequest) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');
        
        const friendRequests = await prisma.zahtjevzaprijateljstvo.findMany({
            where: {
                idprimatelj: req.session.korisnik.idkorisnik,
                nazivstatus: {
                    notIn: ['accepted', 'denied']
                }
            },
            include: {
                korisnik_zahtjevzaprijateljstvo_idposiljateljTokorisnik: true,
            }
        });

        return friendRequests as ApiFriendRequests;
    }

    @Post()
    @HttpCode(201)
    public async addNewFriendRequest(@Req() req: NextApiRequest, @Body(ValidationPipe) dto: AddFriendRequestDTO) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');

        const newFriendRequest = await prisma.zahtjevzaprijateljstvo.create({
            data: {
                idposiljatelj: req.session.korisnik.idkorisnik,
                idprimatelj: dto.idPrimatelj,
                nazivstatus: 'awaiting confirmation',
                poruka: dto.poruka,
            },
        });

        return newFriendRequest;
    }
}

export default withSessionRoute(createHandler(FriendRequestsController));