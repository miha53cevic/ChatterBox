import { korisnik, poruka, pripadarazgovoru, razgovor, reakcijanaporuku, zahtjevzaprijateljstvo } from "@prisma/client";

export interface UsersWithSimiliarNameData {
    user: korisnik,
    nazivstatus: string | null,
};
export type ApiUsersWithSimiliarName = UsersWithSimiliarNameData[];

export type Chat = (razgovor & {
    pripadarazgovoru: (pripadarazgovoru & {
        korisnik: korisnik;
    })[];
});

export type ApiChats = Chat[];

export type ApiFriendRequests = (zahtjevzaprijateljstvo & {
    korisnik_zahtjevzaprijateljstvo_idposiljateljTokorisnik: korisnik;
})[];

export type ApiSession = korisnik;

export type ApiFriends = korisnik[];

export type ApiGetForChatMessages = (poruka & {
    korisnik: korisnik;
    reakcijanaporuku: reakcijanaporuku[];
})[]