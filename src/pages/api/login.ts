import { Body, createHandler, Post, UnauthorizedException, ValidationPipe, Req } from 'next-api-decorators';
import { IsNotEmpty, IsEmail } from 'class-validator';
import type { NextApiRequest } from "next";

import withSessionRoute from "../../lib/withSessionRoute";
import { prisma } from "../../server/db";

class LoginDTO {
    @IsNotEmpty()
    usernameOrEmail!: string;

    @IsNotEmpty()
    password!: string;
}

class LoginController {
    @Post()
    public async login(@Req() req: NextApiRequest, @Body(ValidationPipe) dto: LoginDTO) {
        const korisnik = await prisma.korisnik.findFirst({
            where: {
                OR: [
                    { korisnickoime: dto.usernameOrEmail },
                    { email: dto.usernameOrEmail },
                ],
                lozinka: dto.password,
            },
        });

        if (!korisnik) throw new UnauthorizedException();

        req.session.korisnik = korisnik;
        await req.session.save();
        return { message: 'OK' };
    }
}

export default withSessionRoute(createHandler(LoginController));