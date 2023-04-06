import { createHandler, Get } from 'next-api-decorators';

import { prisma } from '../../server/db';

class UsersController {
    @Get()
    public async listUsers() {
        const users = await prisma.user.findMany({
            include: {
                profile: true,
            }
        });
        return users;
    }
}

export default createHandler(UsersController);