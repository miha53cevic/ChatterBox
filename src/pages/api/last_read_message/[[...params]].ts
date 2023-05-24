import { createHandler, Get, UnauthorizedException, Req, Param, Post, HttpCode, Body, ValidationPipe } from 'next-api-decorators';
import type { NextApiRequest } from "next";
import { prisma } from '../../../server/db';

import withSessionRoute from "../../../lib/withSessionRoute";
import { IsNotEmpty } from 'class-validator';

class UpdateLastReadMessageDTO {
    @IsNotEmpty()
    idChat!: number;

    @IsNotEmpty()
    idPoruka!: number;
}

class LastReadMessageController {
    @Get('/:idChat')
    public async getLastReadMessagesByEveryUserInChat(@Req() req: NextApiRequest, @Param('idChat') idChatStr: string) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');

        const idChat = Number.parseInt(idChatStr);
    
        const lastReadMessages = await prisma.pripadarazgovoru.findMany({
            where: {
                idrazgovor: idChat,
            },
            select: {
                korisnik: true,
                poruka: true,
            }
        });

        return lastReadMessages;
    }

    @Post('/')
    @HttpCode(201)
    public async updateLastReadMessage(@Req() req: NextApiRequest, @Body(ValidationPipe) dto: UpdateLastReadMessageDTO) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');

        const newLastReadMessage = await prisma.pripadarazgovoru.update({
            where: {
                idkorisnik_idrazgovor: {
                    idkorisnik: req.session.korisnik.idkorisnik,
                    idrazgovor: dto.idChat,
                },
            },
            data: {
                idzadnjaporuka: dto.idPoruka,
            }
        });

        return newLastReadMessage;
    }
}

export default withSessionRoute(createHandler(LastReadMessageController));