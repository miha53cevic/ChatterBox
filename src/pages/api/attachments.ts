import { multimedijalnizapis } from "@prisma/client";
import type { NextApiRequest } from "next";
import { Post, HttpCode, Req, Param, Body, ValidationPipe, UnauthorizedException, createHandler } from "next-api-decorators";
import withSessionRoute from "../../lib/withSessionRoute";
import { prisma } from "../../server/db";
import { IsNotEmpty } from "class-validator";

class AddAttachmentToMessage {
    @IsNotEmpty()
    idMsg!: number;
    
    @IsNotEmpty()
    url!: string;
}

class AttachmentsController {
    @Post('/')
    @HttpCode(201)
    public async addAttachmentToMessage(@Req() req: NextApiRequest, @Param('idChat') idChatStr: string, @Body(ValidationPipe) dto: AddAttachmentToMessage) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');

        const newAttachment = await prisma.multimedijalnizapis.create({
            data: {
                idporuka: dto.idMsg,
                url: dto.url,
            },
        });
        console.log("DB_LOG: Saving new attachment to db: ", newAttachment);

        return newAttachment as multimedijalnizapis;
    }
}

export default withSessionRoute(createHandler(AttachmentsController));