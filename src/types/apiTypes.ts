import { korisnik, pripadarazgovoru, razgovor, zahtjevzaprijateljstvo } from "@prisma/client";

export interface UsersWithSimiliarNameData {
    user: korisnik,
    nazivstatus: string | null,
};
export type ApiUsersWithSimiliarName = UsersWithSimiliarNameData[];

export type ApiChats = (razgovor & {
    pripadarazgovoru: (pripadarazgovoru & {
        korisnik: korisnik;
    })[];
})[];

export type ApiFriendRequests = (zahtjevzaprijateljstvo & {
    korisnik_zahtjevzaprijateljstvo_idposiljateljTokorisnik: korisnik;
})[];

export type ApiSession = korisnik;

export type ApiFriends = korisnik[];