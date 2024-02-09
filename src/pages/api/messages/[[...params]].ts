import { createHandler, Get, UnauthorizedException, Req, Param, Post, HttpCode, Body, ValidationPipe } from 'next-api-decorators';
import type { NextApiRequest } from "next";
import { prisma } from '../../../server/db';
import { poruka } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

import withSessionRoute from "../../../lib/withSessionRoute";

import type { ApiGetForChatMessages } from '../../../types/apiTypes';

class AddMessageToChatDTO {
    @IsNotEmpty()
    messageText!: string;
}

class MessagesController {
    @Get('/:idChat')
    public async getMessagesForChat(@Req() req: NextApiRequest, @Param('idChat') idChatStr: string) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');

        const idChat = Number.parseInt(idChatStr);

        const messages = await prisma.poruka.findMany({
            where: {
                idrazgovor: idChat,
            },
            orderBy: {
                timestamp: 'asc',
            },
            include: {
                korisnik: true,
                reakcijanaporuku: true,
                multimedijalnizapis: true,
            }
        });

        return messages as ApiGetForChatMessages;;
    }

    @Post('/:idChat')
    @HttpCode(201)
    public async addMessageToChat(@Req() req: NextApiRequest, @Param('idChat') idChatStr: string, @Body(ValidationPipe) dto: AddMessageToChatDTO ) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');

        const idChat = Number.parseInt(idChatStr);

        const newMsg = await prisma.poruka.create({
            data: {
                idrazgovor: idChat,
                idposiljatelj: req.session.korisnik.idkorisnik,
                tekst: dto.messageText,
            },
        });
        console.log("DB_LOG: Saving new message to db: ", newMsg);
        
        return newMsg as poruka;
    }
}

export default withSessionRoute(createHandler(MessagesController));