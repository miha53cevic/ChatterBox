import { createHandler, Get, UnauthorizedException, Req } from 'next-api-decorators';
import type { NextApiRequest } from "next";
import { prisma } from '../../server/db';

import withSessionRoute from "../../lib/withSessionRoute";

import type { ApiSession } from '../../types/apiTypes';

class SessionController {
    @Get()
    public async session(@Req() req: NextApiRequest) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');

        const korisnik = await prisma.korisnik.findFirst({
            where: {
                korisnickoime: req.session.korisnik.korisnickoime,
                email: req.session.korisnik.email,
                lozinka: req.session.korisnik.lozinka,
            },
        });

        if (!korisnik) {
            req.session.destroy();
            throw new UnauthorizedException('Set cookie is invalid!');
        }

        req.session.korisnik = korisnik;
        await req.session.save();
        return req.session.korisnik as ApiSession;
    }
}

export default withSessionRoute(createHandler(SessionController));