import { Body, createHandler, Post, HttpCode, ValidationPipe, UnauthorizedException, Req } from 'next-api-decorators';
import { IsNotEmpty } from 'class-validator';
import type { NextApiRequest } from 'next';
import * as bcrypt from 'bcrypt';

import withSessionRoute from "../../lib/withSessionRoute";
import { prisma } from "../../server/db";

class ChangePasswordDTO {
    @IsNotEmpty()
    newPassword!: string;
}

class ChangePasswordController {
    @Post()
    @HttpCode(200)
    public async changeTheme(@Req() req: NextApiRequest, @Body(ValidationPipe) dto: ChangePasswordDTO) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');

        const encryptedPass = bcrypt.hashSync(dto.newPassword, 10);
        const updatedKorisnik = await prisma.korisnik.update({
            data: {
                lozinka: encryptedPass,
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

export default withSessionRoute(createHandler(ChangePasswordController));