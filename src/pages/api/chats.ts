import { createHandler, Get, UnauthorizedException, Req } from 'next-api-decorators';
import type { NextApiRequest } from "next";

import withSessionRoute from "../../lib/withSessionRoute";
import { prisma } from '../../server/db';

class ChatsController {
    @Get()
    public async getUsersChats(@Req() req: NextApiRequest) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');

        const chats = await prisma.razgovor.findMany({
            where: {
                pripadarazgovoru: {
                    some: {
                        idkorisnik: req.session.korisnik.idkorisnik,
                    }
                }
            },
            select: {
                idrazgovor: true,
                avatarurl: true,
                grupa: true,
                pripadarazgovoru: {
                    select: {
                        korisnik: {
                            select: {
                                idkorisnik: true,
                                korisnickoime: true,
                            }
                        }
                    }
                }
            },
        });

        // Makni trenutni user iz popisa usera
        for (let i = 0; i < chats.length; i++) {
            chats[i].pripadarazgovoru = chats[i].pripadarazgovoru.filter(user => user.korisnik.idkorisnik !== req.session.korisnik?.idkorisnik)
        }

        return chats;
    }
}

export default withSessionRoute(createHandler(ChatsController));