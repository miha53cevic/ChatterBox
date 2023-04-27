import { NextApiHandler } from "next";
import { withIronSessionApiRoute } from "iron-session/next";
import ironOptions from "./ironOptions";

import type { korisnik } from '@prisma/client';

declare module "iron-session" {
    interface IronSessionData {
        korisnik: korisnik | null
    }
}

export function withSessionRoute(handler: NextApiHandler) {
    return withIronSessionApiRoute(handler, ironOptions);
}

export default withSessionRoute;