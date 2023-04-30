import React from 'react';
import { Typography, Box, IconButton, Stack } from '@mui/material';
import useSWR from 'swr';
import { Fetcher } from '../../lib/Fetcher';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import Loading from '../../layouts/Loading';
import { korisnik } from '@prisma/client';
import FriendListItem from '../FriendListItem';

const FriendRequestsList: React.FC = () => {

    const { data, error, isLoading } = useSWR('/api/friend_requests', Fetcher<korisnik[]>);

    if (isLoading) return <Loading />;
    if (error) return <pre>{JSON.stringify(error)}</pre>;
    if (!data) return <b>No data received!</b>;
    return (
        <>
            <Typography variant='h3'>Friend requests</Typography>
            <br/><br/>
            <Box sx={{ overflowY: 'scroll' }}>
                {data.map((request, index) => (
                    <React.Fragment key={index}>
                        <FriendListItem user={request}>
                            <IconButton>
                                <CheckIcon fontSize="large" sx={{ color: 'green' }} />
                            </IconButton>
                            <IconButton>
                                <CloseIcon fontSize="large" sx={{ color: 'red' }} />
                            </IconButton>
                        </FriendListItem>
                        <hr />
                    </React.Fragment>
                ))}
            </Box>
        </>
    );
};

export default FriendRequestsList;