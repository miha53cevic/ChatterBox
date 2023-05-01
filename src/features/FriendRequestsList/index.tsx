import React from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import useSWR, { mutate as globalMutate } from 'swr';
import { Fetcher, Poster } from '../../lib/Fetcher';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import Loading from '../../layouts/Loading';
import FriendListItem from '../FriendListItem';
import useErrorAlert from '../../hooks/useErrorAlert';

import type { ApiFriendRequests } from '../../types/apiTypes';

const FriendRequestsList: React.FC = () => {
    const showError = useErrorAlert();

    const acceptRequest = async (idPosiljatelj: number) => {
        try {
            const res = await Poster('/api/friend_requests/accept', { arg: { idPosiljatelj: idPosiljatelj } });
            // Update friend Requests and Friends
            await mutate();
            await globalMutate('/api/friends');
        } catch(err) {
            showError(JSON.stringify(err));
        }
    };
    const denyRequest = async (idPosiljatelj: number) => {
        try {
            const res = await Poster('/api/friend_requests/deny', { arg: { idPosiljatelj: idPosiljatelj } });
            // Update friend Requests and Friends
            await mutate();
            await globalMutate('/api/friends');
        } catch(err) {
            showError(JSON.stringify(err));
        }
    };

    // TODO - vidjeti opcionalnu poruku

    const { data, error, isLoading, mutate } = useSWR('/api/friend_requests', Fetcher<ApiFriendRequests>);

    if (isLoading) return <Loading />;
    if (error) return <pre>{JSON.stringify(error)}</pre>;
    if (!data) return <b>No data received!</b>;
    return (
        <>
            <Typography variant='h3'>Friend requests</Typography>
            <br/><br/>
            <Box>
                {data.map((request, index) => (
                    <React.Fragment key={index}>
                        <FriendListItem user={request.korisnik_zahtjevzaprijateljstvo_idposiljateljTokorisnik}>
                            <IconButton onClick={() => acceptRequest(request.idposiljatelj)}>
                                <CheckIcon fontSize="large" sx={{ color: 'green' }} />
                            </IconButton>
                            <IconButton onClick={() => denyRequest(request.idposiljatelj)}>
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