import { Body, createHandler, Post, HttpCode, ValidationPipe, UnauthorizedException, Req } from 'next-api-decorators';
import { IsNotEmpty } from 'class-validator';
import type { NextApiRequest } from 'next';

import withSessionRoute from "../../lib/withSessionRoute";
import { prisma } from "../../server/db";

class ThemeDTO {
    @IsNotEmpty()
    themeIndex!: number;
}

class ThemeController {
    @Post()
    @HttpCode(200)
    public async changeTheme(@Req() req: NextApiRequest, @Body(ValidationPipe) dto: ThemeDTO) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');

        const updatedKorisnik = await prisma.korisnik.update({
            data: {
                izgledapp: dto.themeIndex,
            },
            where: {
                idkorisnik: req.session.korisnik.idkorisnik,
            }
        });
        
        req.session.korisnik = updatedKorisnik;
        await req.session.save();
        return { message: 'ok' };
    }
}

export default withSessionRoute(createHandler(ThemeController));