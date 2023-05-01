import { korisnik, zahtjevzaprijateljstvo } from "@prisma/client";

export interface UsersWithSimiliarNameData {
    user: korisnik,
    nazivstatus: string | null,
};
export type ApiUsersWithSimiliarName = UsersWithSimiliarNameData[];

export type ApiChats = {
    pripadarazgovoru: {
        korisnik: {
            idkorisnik: number;
            korisnickoime: string;
        };
    }[];
    avatarurl: string | null;
    idrazgovor: number;
    grupa: boolean;
}[];

export type ApiFriendRequests = (zahtjevzaprijateljstvo & {
    korisnik_zahtjevzaprijateljstvo_idposiljateljTokorisnik: korisnik;
})[];

export type ApiSession = korisnik;

export type ApiFriends = korisnik[];