import { createHandler, Get, UnauthorizedException, Req, Param } from 'next-api-decorators';
import type { NextApiRequest } from "next";

import withSessionRoute from "../../../lib/withSessionRoute";
import { prisma } from '../../../server/db';

class UsersUsernameController {
    @Get('/:username')
    public async getUsersWithSimiliarUsername(@Req() req: NextApiRequest, @Param('username') username: string) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');
        
        const possibleSearchedUsers = await prisma.korisnik.findMany({
            where: {
                korisnickoime: {
                    contains: username,
                },
                NOT: {
                    idkorisnik: req.session.korisnik.idkorisnik,
                }
            },
        });

        return possibleSearchedUsers;
    }
}

export default withSessionRoute(createHandler(UsersUsernameController));