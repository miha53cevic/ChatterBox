import { createHandler, Get, UnauthorizedException, Req } from 'next-api-decorators';
import type { NextApiRequest } from "next";

import withSessionRoute from "../../lib/withSessionRoute";
import { prisma } from '../../server/db';
import { korisnik } from '@prisma/client';

class FriendsController {
    @Get()
    public async getUserFriends(@Req() req: NextApiRequest) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');

        const friends = await prisma.prijatelji.findMany({
            where: {
                OR: [
                    { idkorisnik1: req.session.korisnik.idkorisnik },
                    { idkorisnik2: req.session.korisnik.idkorisnik }
                ]
            },
            include: {
                korisnik_prijatelji_idkorisnik1Tokorisnik: true,
                korisnik_prijatelji_idkorisnik2Tokorisnik: true,
            }
        });

        // Return only the friends withouth the current user
        let friendsData: korisnik[] = []; 
        for (const friend of friends) {
            if (friend.idkorisnik1 !== req.session.korisnik.idkorisnik)
                friendsData.push(friend.korisnik_prijatelji_idkorisnik1Tokorisnik);
            else if (friend.idkorisnik2 !== req.session.korisnik.idkorisnik)
                friendsData.push(friend.korisnik_prijatelji_idkorisnik2Tokorisnik);
        };

        return friendsData;
    }
}

export default withSessionRoute(createHandler(FriendsController));