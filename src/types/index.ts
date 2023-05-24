import { korisnik } from "@prisma/client";

export interface IMessage {
    idChat: number,
    idMsg: number,
    tekst: string,
    posiljatelj: korisnik,
    timestamp: string,
};

export type IUserStatus = 'online' | 'away' | 'offline';

export interface IConnectedUser {
    user: korisnik,
    status: IUserStatus,
};

export interface INotification {
    idChat: number,
    unreadCount: number,
};