import { Body, createHandler, Post, HttpCode, ValidationPipe, UnauthorizedException, Req } from 'next-api-decorators';
import { IsNotEmpty } from 'class-validator';
import type { NextApiRequest } from 'next';

import withSessionRoute from "../../lib/withSessionRoute";
import { prisma } from "../../server/db";

class ChangeAvatarDTO {
    @IsNotEmpty()
    newAvatarUrl!: string;
}

class ChangeAvatarController {
    @Post()
    @HttpCode(200)
    public async changeAvatar(@Req() req: NextApiRequest, @Body(ValidationPipe) dto: ChangeAvatarDTO) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');

        const updatedKorisnik = await prisma.korisnik.update({
            data: {
                avatarurl: dto.newAvatarUrl,
            },
            where: {
                idkorisnik: req.session.korisnik.idkorisnik,
            }
        });
        
        updatedKorisnik.lozinka = "";
        req.session.korisnik = updatedKorisnik;
        await req.session.save();
        return { message: 'ok' };
    }
}

export default withSessionRoute(createHandler(ChangeAvatarController));