import { Box, CircularProgress, ListItemButton, TextField } from "@mui/material";
import { korisnik } from "@prisma/client";
import { useState } from "react";
import useSWR from 'swr';

import { Fetcher } from "../../lib/Fetcher";
import FriendListItem from "../FriendListItem";

import type { ApiChats } from "../../types/apiTypes";

export interface Props {
    user: korisnik
};

const ChatList: React.FC<Props> = ({ user }) => {
    
    const { data, error, isLoading } = useSWR(`/api/chats`, Fetcher<ApiChats>);

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
                        <FriendListItem user={user} />
                    </ListItemButton>
                ))
            }
        </Box>
    );
};

export default ChatList;