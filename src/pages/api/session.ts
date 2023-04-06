import { createHandler, Get, UnauthorizedException, Req } from 'next-api-decorators';
import type { NextApiRequest } from "next";

import withSessionRoute from "../../lib/withSessionRoute";

class SessionController {
    @Get()
    public async session(@Req() req: NextApiRequest) {
        if (!req.session.user) throw new UnauthorizedException('User not logged in!');
        return req.session.user;
    }
}

export default withSessionRoute(createHandler(SessionController));