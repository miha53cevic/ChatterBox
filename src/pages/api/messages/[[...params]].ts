import { createHandler, Get, UnauthorizedException, Req, Param, Post, Body, ValidationPipe, HttpCode } from 'next-api-decorators';
import type { NextApiRequest } from "next";
import { prisma } from '../../../server/db';

import withSessionRoute from "../../../lib/withSessionRoute";

import type { ApiGetForChatMessages } from '../../../types/apiTypes';
import { IsNotEmpty } from 'class-validator';

class AddAttachmentDTO {
    @IsNotEmpty()
    idMessage!: number;

    @IsNotEmpty()
    attachmenturls!: string[];
};

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
            }
        });

        return messages as ApiGetForChatMessages;;
    }

    @Post('/attachment')
    @HttpCode(201)
    public async addAttachmentToMessage(@Req() req: NextApiRequest, @Body(ValidationPipe) dto: AddAttachmentDTO) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');

        const data = dto.attachmenturls.map(url => ({ idporuka: dto.idMessage, url: url }));

        const attachments = await prisma.multimedijalnizapis.createMany({
            data: data,
        });

        return attachments;
    }
}

export default withSessionRoute(createHandler(MessagesController));