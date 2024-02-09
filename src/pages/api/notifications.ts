import { createHandler, UnauthorizedException, Req, Get } from 'next-api-decorators';
import type { NextApiRequest } from "next";

import withSessionRoute from "../../lib/withSessionRoute";
import { prisma } from '../../server/db';
import { INotification } from '../../types';

class NotificationsController {
    @Get()
    public async createReaction(@Req() req: NextApiRequest) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');
        const notifications: INotification[] = [];
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
                pripadarazgovoru: {
                    where: {
                        idkorisnik: req.session.korisnik.idkorisnik,
                    },
                    select: {
                        poruka: {
                            select: {
                                idporuka: true,
                            }
                        },
                    }
                }
            }
        });
        for (const { idrazgovor, pripadarazgovoru } of chats) {
            const idLastMessage = pripadarazgovoru[0].poruka?.idporuka;
            const unreadCount = await prisma.poruka.count({
                where: {
                    idrazgovor: idrazgovor,
                    idporuka: {
                        gt: idLastMessage, // Sve poruke nakon zadnje sigurno imaju veci id
                    }
                },
            });
            if (unreadCount > 0) {
                notifications.push({
                    idChat: idrazgovor,
                    unreadCount: unreadCount,
                });
            }
        }

        return notifications as INotification[];
    }
}

export default withSessionRoute(createHandler(NotificationsController));