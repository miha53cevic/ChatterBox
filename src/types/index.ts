import { korisnik } from "@prisma/client";

export interface IMessage {
    idChat: number,
    tekst: string,
    posiljatelj: korisnik,
    timestamp: string,
};

export type IUserStatus = 'online' | 'away' | 'offline';

export interface IConnectedUser {
    user: korisnik,
    status: IUserStatus,
};