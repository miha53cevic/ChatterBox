import React from 'react';
import { Typography, Box, Stack, IconButton } from "@mui/material";
import useSWR from 'swr';
import DeleteIcon from '@mui/icons-material/Delete';

import { Fetcher, Deleter } from "../../lib/Fetcher";
import Loading from "../../layouts/Loading";
import FriendListItem from '../FriendListItem';
import useErrorAlert from '../../hooks/useErrorAlert';

import type { ApiFriends } from '../../types/apiTypes';

const FriendsList: React.FC = () => {
    const showError = useErrorAlert();

    const handleFriendDelete = async (idFriend: number) => {
        try {
            const res = await Deleter(`/api/friends/${idFriend}`);
            await mutate();
        } catch(err) {
            showError(JSON.stringify(err));
        }
    };

    const { data, error, isLoading, mutate } = useSWR('/api/friends', Fetcher<ApiFriends>);

    if (isLoading) return <Loading />;
    if (error) return <pre>{JSON.stringify(error)}</pre>;
    if (!data) return <b>No data received!</b>;
    return (
        <>
            <Typography variant='h3'>Friends</Typography>
            <br/><br/>
            <Box>
                {data.map((friend, index) => (
                    <React.Fragment key={index}>
                        <FriendListItem user={friend}>
                            <Stack direction='row' alignItems='center'>
                                <IconButton onClick={() => handleFriendDelete(friend.idkorisnik)}>
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