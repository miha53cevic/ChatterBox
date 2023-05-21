import { createHandler, Get, UnauthorizedException, Req, Param } from 'next-api-decorators';
import type { NextApiRequest } from "next";
import { prisma } from '../../../server/db';

import withSessionRoute from "../../../lib/withSessionRoute";

import type { ApiGetForChatMessages } from '../../../types/apiTypes';

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
            }
        });

        return messages as ApiGetForChatMessages;;
    }
}

export default withSessionRoute(createHandler(MessagesController));