import { Body, createHandler, Post, HttpCode, ValidationPipe, UnauthorizedException, Req, Param, Delete } from 'next-api-decorators';
import { IsNotEmpty } from 'class-validator';
import type { NextApiRequest } from 'next';

import withSessionRoute from "../../../lib/withSessionRoute";
import { prisma } from "../../../server/db";

class ChangeGroupNameDTO {
    @IsNotEmpty()
    idGroup!: number;
    newGroupName!: string;
}

class ChangeAvatarDTO {
    @IsNotEmpty()
    idGroup!: number;
    avatarurl!: string;
}

class AddUsersToGroupDTO {
    @IsNotEmpty()
    idGroup!: number;
    idUsers!: number[];
}

class GroupController {
    @Post('/changeName')
    @HttpCode(201)
    public async changeGroupName(@Req() req: NextApiRequest, @Body(ValidationPipe) dto: ChangeGroupNameDTO) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');

        const res = await prisma.razgovor.update({
            data: {
                nazivGrupe: dto.newGroupName,
            },
            where: {
                idrazgovor: dto.idGroup,
            }
        });

        return res;
    }

    @Post('/changeAvatar')
    @HttpCode(201)
    public async changeAvatar(@Req() req: NextApiRequest, @Body(ValidationPipe) dto: ChangeAvatarDTO) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');

        const res = await prisma.razgovor.update({
            data: {
                avatarurl: dto.avatarurl,
            },
            where: {
                idrazgovor: dto.idGroup,
            }
        });

        return res;
    }

    @Post('/addUsersToGroup')
    @HttpCode(201)
    public async addUsersToGroup(@Req() req: NextApiRequest, @Body(ValidationPipe) dto: AddUsersToGroupDTO) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');

        const data = dto.idUsers.map(idUser => ({
            idkorisnik: idUser,
            idrazgovor: dto.idGroup,
        }));

        const res = await prisma.pripadarazgovoru.createMany({
            data: data,
        });

        return res;
    }

    @Delete('/leaveGroup/:idGroup')
    public async leaveGroup(@Req() req: NextApiRequest, @Param('idGroup') idGroupStr: string) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');

        const idGroup = Number.parseInt(idGroupStr);

        const res = await prisma.pripadarazgovoru.delete({
            where: {
                idkorisnik_idrazgovor: {
                    idkorisnik: req.session.korisnik.idkorisnik,
                    idrazgovor: idGroup
                }
            }
        });

        return res;
    }
}

export default withSessionRoute(createHandler(GroupController));