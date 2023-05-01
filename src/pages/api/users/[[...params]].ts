import { createHandler, Get, UnauthorizedException, Req, Param } from 'next-api-decorators';
import type { NextApiRequest } from "next";

import withSessionRoute from "../../../lib/withSessionRoute";
import { prisma } from '../../../server/db';

import type { UsersWithSimiliarNameData, ApiUsersWithSimiliarName } from '../../../types/apiTypes';

class UsersController {
    @Get('/:username')
    public async getUsersWithSimiliarUsername(@Req() req: NextApiRequest, @Param('username') username: string) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');

        const possibleSearchedUsers = await prisma.korisnik.findMany({
            where: {
                korisnickoime: {
                    contains: username,
                },
                NOT: [
                    { idkorisnik: req.session.korisnik.idkorisnik },
                ],
            },
        });

        // Add to each user if he has a friend request already to him, works both ways (if a user tries adding an already accepted friend will show accepted, OR clause)
        const data: UsersWithSimiliarNameData[] = [];
        for (const user of possibleSearchedUsers) {
            const hasFriendRequest = await prisma.zahtjevzaprijateljstvo.findFirst({
                where: {
                    OR: [
                        {
                            idposiljatelj: req.session.korisnik.idkorisnik,
                            korisnik_zahtjevzaprijateljstvo_idprimateljTokorisnik: {
                                idkorisnik: user.idkorisnik,
                            }
                        },
                        {
                            idprimatelj: req.session.korisnik.idkorisnik,
                            korisnik_zahtjevzaprijateljstvo_idposiljateljTokorisnik: {
                                idkorisnik: user.idkorisnik,
                            }
                        }
                    ]
                },
                select: {
                    nazivstatus: true
                }
            });
            data.push({
                user: user,
                nazivstatus: hasFriendRequest ? hasFriendRequest.nazivstatus : null,
            });
        }

        return data as ApiUsersWithSimiliarName;
    }
}

export default withSessionRoute(createHandler(UsersController));