import { Box, CircularProgress, ListItemButton, Stack, TextField, Typography } from "@mui/material";
import { korisnik } from "@prisma/client";
import { useState } from "react";
import useSWR from 'swr';

import { Fetcher } from "../../lib/Fetcher";

export interface ChatData {
    idrazgovor: number,
    avatarurl?: string,
    grupa: boolean,
    pripadarazgovoru: {
        korisnik: {
            idkorisnik: number,
            korisnickoime: string,
        }
    }[]
};

export interface Props {
    user: korisnik
};

const ChatList: React.FC<Props> = ({ user }) => {
    
    const { data, error, isLoading } = useSWR(`/api/chats`, Fetcher<ChatData[]>);

    const [search, setSearch] = useState("");

    if (error) return <pre style={{ maxWidth: '200px' }}>{JSON.stringify(error)}</pre>;
    if (!data) return <b>Undefined data error</b>;
    return (
        <Box sx={{ width: 400 }}>
            <TextField variant='filled' label='Search...' onChange={(e) => setSearch(e.target.value.toLowerCase())} fullWidth /> 
            <br/><br/>
            {isLoading ?
                <CircularProgress />
                :
                data.filter(item => item.pripadarazgovoru.find(i => i.korisnik.idkorisnik !== user.idkorisnik)?.korisnik.korisnickoime.toLowerCase().includes(search)).map((item, index) => (
                    <ListItemButton key={index}>
                        <Stack direction='row'>
                            <img width='100px' height='100px' src={item.avatarurl} alt='user avatar' />
                            <Box>
                                <Typography>{item.pripadarazgovoru.find(i => i.korisnik.idkorisnik !== user.idkorisnik)?.korisnik.korisnickoime}</Typography>
                            </Box>
                        </Stack>
                    </ListItemButton>
                ))
            }
        </Box>
    );
};

export default ChatList;