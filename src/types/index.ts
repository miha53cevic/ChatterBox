import { korisnik } from "@prisma/client";

export interface IMessage {
    idChat: number,
    tekst: string,
    posiljatelj: korisnik,
    timestamp: string,
};