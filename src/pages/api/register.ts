import { Body, createHandler, Post, HttpCode, ValidationPipe } from 'next-api-decorators';
import { IsNotEmpty, IsEmail } from 'class-validator';

import withSessionRoute from "../../lib/withSessionRoute";
import { prisma } from "../../server/db";

class RegisterDTO {
    @IsNotEmpty()
    name!: string;

    @IsEmail()
    email!: string;

    bio?: string;

    @IsNotEmpty()
    password!: string;
}

class RegisterController {
    @Post()
    @HttpCode(201)
    public async addUser(@Body(ValidationPipe) dto: RegisterDTO) {
        const newUser = await prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                password: dto.password,
                profile: {
                    create: { bio: dto.bio },
                },

            },
        });
        return newUser;
    }
}

export default withSessionRoute(createHandler(RegisterController));