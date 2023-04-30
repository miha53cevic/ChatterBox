import React from 'react';
import { Typography, Box, Stack, IconButton } from "@mui/material";
import { korisnik } from "@prisma/client";
import useSWR from 'swr';
import DeleteIcon from '@mui/icons-material/Delete';

import { Fetcher } from "../../lib/Fetcher";
import Loading from "../../layouts/Loading";
import FriendListItem from '../FriendListItem';

const FriendsList: React.FC = () => {

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
                        <FriendListItem user={friend}>
                            <Stack direction='row' alignItems='center'>
                                <IconButton>
                                    <DeleteIcon fontSize="large" sx={{ color: 'red' }} />
                                </IconButton>
                            </Stack>
                        </FriendListItem>
                        <hr />
                    </React.Fragment>
                ))}
            </Box>
        </>
    );
};

export default FriendsList;