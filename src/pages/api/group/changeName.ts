import { Body, createHandler, Post, HttpCode, ValidationPipe, UnauthorizedException, Req } from 'next-api-decorators';
import { IsNotEmpty } from 'class-validator';
import type { NextApiRequest } from 'next';

import withSessionRoute from "../../../lib/withSessionRoute";
import { prisma } from "../../../server/db";

class ChangeGroupNameDTO {
    @IsNotEmpty()
    idGroup!: number;
    newGroupName!: string;
}

class ChangeGroupNameController {
    @Post()
    @HttpCode(200)
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
}

export default withSessionRoute(createHandler(ChangeGroupNameController));