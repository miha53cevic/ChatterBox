import { multimedijalnizapis } from "@prisma/client";
import type { NextApiRequest } from "next";
import { Post, HttpCode, Req, UnauthorizedException, createHandler, Get, Param } from "next-api-decorators";
import withSessionRoute from "../../../lib/withSessionRoute";
import { prisma } from "../../../server/db";
import { formidable } from 'formidable';
import PersistentFile from "formidable/PersistentFile";
import * as fs from 'fs';

export const config = {
    api: {
        bodyParser: false
    }
}

class AttachmentsController {
    @Get('/:id')
    public async getAttachment(@Req() req: NextApiRequest, @Param('id') id: string) {

        const attachment = await prisma.multimedijalnizapis.findUnique({
            where: {
                 idzapis: +id
            }
        });

        if (!attachment) throw new UnauthorizedException('Attachment not found!');

        return attachment.blob as Buffer;

    }

    @Post('/')
    @HttpCode(201)
    public async addAttachmentToMessage(@Req() req: NextApiRequest) {
        if (!req.session.korisnik) throw new UnauthorizedException('User not logged in!');

        const data = await new Promise((resolve, reject) => {
            const form = formidable();
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                resolve({ fields, files });
            });
        });
        const idMsg = (data as any).fields.idMsg[0] as string;
        const file = (data as any).files.image[0] as PersistentFile & { filepath: string };

        const buffer = await fs.promises.readFile(file.filepath);

        const newAttachment = await prisma.multimedijalnizapis.create({
            data: {
                idporuka: +idMsg,
                blob: buffer,
            },
        });
        console.log("DB_LOG: Saving new attachment to db: ", newAttachment);

        return newAttachment as multimedijalnizapis;
    }
}

export default withSessionRoute(createHandler(AttachmentsController));