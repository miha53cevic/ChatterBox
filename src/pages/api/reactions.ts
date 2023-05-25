import { createHandler, UnauthorizedException, Req, Post, HttpCode, ValidationPipe, Body } from 'next-api-decorators';
import type { NextApiRequest } from "next";
import { IsNotEmpty } from 'class-validator';

import withSessionRoute from "../../lib/withSessionRoute";
import { prisma } from '../../server/db';

class CreateReactionDTO {
    @IsNotEmpty()
    idPoruka!: number;

    @IsNotEmpty()
    emoji!: string;
};

class ReactionsController {
    @Post()
    @HttpCode(201)
    public async createReaction(@Req() req: NextApiRequest, @Body(ValidationPipe) dto: CreateReactionDTO) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');

        const reaction = await prisma.reakcijanaporuku.create({
            data: {
                idporuka: dto.idPoruka,
                emoticon: dto.emoji,
            },
        });

        return reaction;
    }
}

export default withSessionRoute(createHandler(ReactionsController));