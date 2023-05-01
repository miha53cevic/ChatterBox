import { createHandler, Get, UnauthorizedException, Req, Delete, Param } from 'next-api-decorators';
import type { NextApiRequest } from "next";
import { korisnik } from '@prisma/client';

import withSessionRoute from "../../../lib/withSessionRoute";
import { prisma } from '../../../server/db';

import type { ApiFriends } from '../../../types/apiTypes';

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

        return friendsData as ApiFriends;
    }

    @Delete('/:idFriend')
    public async deleteUserFriend(@Req() req: NextApiRequest, @Param('idFriend') idFriendStr: string) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');

        const idFriend = Number.parseInt(idFriendStr);

        // Delete zahtjev za prijateljstvo medu tim korisnicima
        const deletedZahtjev = await prisma.zahtjevzaprijateljstvo.deleteMany({
            where: {
                OR: [
                    {
                        idprimatelj: req.session.korisnik.idkorisnik,
                        idposiljatelj: idFriend,
                    },
                    {
                        idprimatelj: idFriend,
                        idposiljatelj: req.session.korisnik.idkorisnik,
                    }
                ]
            }
        });

        const deletedFriend = await prisma.prijatelji.deleteMany({
            where: {
                OR: [
                    {
                        idkorisnik1: req.session.korisnik.idkorisnik,
                        idkorisnik2: idFriend,
                    },
                    {
                        idkorisnik1: idFriend,
                        idkorisnik2: req.session.korisnik.idkorisnik,
                    }
                ]
            }
        });

        return {
            deletedZahtjev,
            deletedFriend
        };
    }
}

export default withSessionRoute(createHandler(FriendsController));