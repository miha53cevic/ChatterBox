import * as React from 'react';
import { Paper, Stack, Container, Typography, Grid } from '@mui/material';
import AccessibleForwardIcon from '@mui/icons-material/AccessibleForward';

import { RegisterForm, LoginForm } from '../features/Forms';

export default function Home() {
    return (
        <Container sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            gap: '2rem'
        }}>
            <Paper sx={{ padding: '2rem' }}>
                <Stack direction='column' alignItems='center' spacing='1rem'>
                    <Typography variant="h4">
                        MUI v5 + Next.js + Prisma + Iron-Session with TypeScript example
                    </Typography>
                    <AccessibleForwardIcon fontSize='large' />
                </Stack>
            </Paper>
            <Grid container spacing='2rem'>
                <Grid item xs={12} md={6}>
                    <RegisterForm />
                </Grid>
                <Grid item xs={12} md={6}>
                    <LoginForm />
                </Grid>
            </Grid>
        </Container>
    );
}
