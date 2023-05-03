import { Body, createHandler, Post, HttpCode, ValidationPipe, ConflictException } from 'next-api-decorators';
import { IsNotEmpty, IsEmail } from 'class-validator';
import * as bcrypt from 'bcrypt';

import withSessionRoute from "../../lib/withSessionRoute";
import { prisma } from "../../server/db";

class RegisterDTO {
    @IsNotEmpty()
    username!: string;

    @IsEmail()
    email!: string;

    @IsNotEmpty()
    password!: string;
}

class RegisterController {
    @Post()
    @HttpCode(201)
    public async addUser(@Body(ValidationPipe) dto: RegisterDTO) {
        const usernameOrEmailExists = await prisma.korisnik.count({
            where: {
                OR: [
                    { email: dto.email },
                    { korisnickoime: dto.username },
                ]
            }
        });
        if (usernameOrEmailExists > 0) throw new ConflictException("Username or email already exists!");

        const encryptedPass = bcrypt.hashSync(dto.password, 10);

        const newUser = await prisma.korisnik.create({
            data: {
                korisnickoime: dto.username,
                email: dto.email,
                lozinka: encryptedPass,
            },
        });
        return newUser;
    }
}

export default withSessionRoute(createHandler(RegisterController));