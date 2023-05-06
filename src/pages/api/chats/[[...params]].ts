import { createHandler, Get, UnauthorizedException, Req, Post, Body, ValidationPipe, HttpCode } from 'next-api-decorators';
import type { NextApiRequest } from "next";

import withSessionRoute from "../../../lib/withSessionRoute";
import { prisma } from '../../../server/db';

import type { ApiChats } from '../../../types/apiTypes';
import { IsNotEmpty } from 'class-validator';

class AddSingleChatDTO {
    @IsNotEmpty()
    idSudionik!: number;
};

class AddGroupChatDTO {
    @IsNotEmpty()
    nazivGrupe!: string;

    @IsNotEmpty()
    idSudionici!: number[];
};

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
            include: {
                pripadarazgovoru: {
                    include: {
                        korisnik: true,
                    }
                }
            }
        });

        // Makni trenutni user iz popisa usera
        for (let i = 0; i < chats.length; i++) {
            chats[i].pripadarazgovoru = chats[i].pripadarazgovoru.filter(user => user.idkorisnik !== req.session.korisnik!.idkorisnik);
        }

        // Makni lozinke od korisnika
        for (let i = 0; i < chats.length; i++) {
            const chat = chats[i];
            for (let j = 0; j < chat.pripadarazgovoru.length; j++) {
                chat.pripadarazgovoru[j].korisnik.lozinka = '';
            }
        }

        return chats as ApiChats;
    }

    @Post('/single')
    @HttpCode(201)
    public async addSingleUserChat(@Req() req: NextApiRequest, @Body(ValidationPipe) dto: AddSingleChatDTO) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');

        const newSingleChat = await prisma.razgovor.create({
            data: {
                grupa: false,
                pripadarazgovoru: {
                    createMany: {
                        data: [
                            {
                                idkorisnik: req.session.korisnik.idkorisnik, // dodaj sebe u grupu
                            },
                            {
                                idkorisnik: dto.idSudionik,
                            }
                        ]
                    }
                }
            },
        });

        return newSingleChat;
    }

    @Post('/group')
    @HttpCode(201)
    public async addGroupUserChat(@Req() req: NextApiRequest, @Body(ValidationPipe) dto: AddGroupChatDTO) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');

        const usersInGroup = dto.idSudionici.map(id => ({
            idkorisnik: id
        }));
        usersInGroup.push({ idkorisnik: req.session.korisnik.idkorisnik }); // dodaj sebe u grupu

        const newGroupChat = await prisma.razgovor.create({
            data: {
                grupa: true,
                nazivGrupe: dto.nazivGrupe,
                pripadarazgovoru: {
                    createMany: {
                        data: usersInGroup,
                    }
                }
            },
        });

        return newGroupChat;
    }
}

export default withSessionRoute(createHandler(ChatsController));