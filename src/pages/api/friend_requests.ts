import { createHandler, Get, UnauthorizedException, Req } from 'next-api-decorators';
import type { NextApiRequest } from "next";

import withSessionRoute from "../../lib/withSessionRoute";
import { prisma } from '../../server/db';

class FriendRequestsController {
    @Get()
    public async getUserFriendRequests(@Req() req: NextApiRequest) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');
        
        const friendRequests = await prisma.zahtjevzaprijateljstvo.findMany({
            where: {
                idprimatelj: req.session.korisnik.idkorisnik,
            },
            include: {
                korisnik_zahtjevzaprijateljstvo_idposiljateljTokorisnik: true,
            }
        });

        return friendRequests;
    }
}

export default withSessionRoute(createHandler(FriendRequestsController));