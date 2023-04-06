import * as React from 'react';
import { Button, Container, Paper, Stack, Typography } from '@mui/material';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axios from 'axios';
import router from 'next/router';
import Link from 'next/link';

async function fetcher(url: string) {
    return await (await axios.get(url)).data;
}

const Profile: React.FC = () => {

    const { isLoading, error, data } = useSWR('/api/session', fetcher, { shouldRetryOnError: false });
    const { trigger } = useSWRMutation('/api/logout', fetcher);

    const handleLogout = async () => {
        try {
            await trigger();
            router.push('/');
        } catch (error) {
            // ...handle error
        }
    };

    if (isLoading) return <p>Loading...</p>;
    if (error) {
        return (
            <Container sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                gap: '2rem'
            }}>
                <Typography>User not logged in!</Typography>
                <Link href='/'>Back to main page</Link>
            </Container>
        );
    }
    else return (
        <Container sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            gap: '2rem'
        }}>
            <Paper sx={{ padding: '2rem' }}>
                <Stack direction='column' spacing='1rem'>
                    <Typography variant="h4">
                        E-Mail: {data.email}
                    </Typography>
                    <Typography variant="h4">
                        Name: {data.name}
                    </Typography>
                    <Typography variant="h4">
                        Bio: {data.bio}
                    </Typography>
                    <Button variant='contained' onClick={handleLogout}>Logout</Button>
                </Stack>
            </Paper>
        </Container>
    );
};

export default Profile;