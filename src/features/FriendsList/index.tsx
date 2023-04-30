import React from 'react';
import { Typography, Box, Stack, IconButton } from "@mui/material";
import { korisnik } from "@prisma/client";
import useSWR from 'swr';
import DeleteIcon from '@mui/icons-material/Delete';

import { Fetcher } from "../../lib/Fetcher";
import Loading from "../../layouts/Loading";

export interface Props {
    user: korisnik,
};

const FriendsList: React.FC<Props> = ({ user }) => {

    const { data, error, isLoading } = useSWR('/api/friends', Fetcher<korisnik[]>);

    if (isLoading) return <Loading />;
    if (error) return <pre>{JSON.stringify(error)}</pre>;
    if (!data) return <b>No data received!</b>;
    return (
        <>
            <Typography variant='h3'>Friends</Typography>
            <br/><br/>
            <Box sx={{ overflowY: 'scroll' }}>
                {data.map((friend, index) => (
                    <React.Fragment key={index}>
                        <Stack direction='row' sx={{ my: '1rem', mr: 2 }} spacing='1rem'>
                            <img src={friend.avatarurl || 'https://picsum.photos/200'} width='100px' height='100px' loading="lazy" alt="user_avatar"
                                style={{ borderRadius: '50%', border: 'solid black' }}
                            />
                            <Box flex='1' alignSelf='center'>
                                <Typography variant='h4'>{friend.korisnickoime}</Typography>
                            </Box>
                            <Stack direction='row' alignItems='center'>
                                <IconButton>
                                    <DeleteIcon fontSize="large" sx={{ color: 'red' }} />
                                </IconButton>
                            </Stack>
                        </Stack>
                        <hr />
                    </React.Fragment>
                ))}
            </Box>
        </>
    );
};

export default FriendsList;