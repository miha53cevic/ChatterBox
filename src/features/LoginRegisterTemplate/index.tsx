import { Box, Button, Grid, Paper, Stack, Typography } from "@mui/material";
import LoginIcon from '@mui/icons-material/Login';
import RegisterIcon from '@mui/icons-material/AppRegistration';

import TopAppBar from '../../layouts/TopAppBar';
import { UnstyledNextLink } from '../../components/NextLink';
import useDesktop from '../../hooks/useDesktop';

export interface Props {
    children: React.ReactNode,
    type: 'login' | 'register',
};

const LoginRegisterTemplate: React.FC<Props> = ({ children, type }) => {

    const desktop = useDesktop();
    return (
        <main>
            <TopAppBar />
            <Box sx={{ minHeight: '100vh' }}>
                <Grid container sx={{ minHeight: '100vh' }}>
                    <Grid item xs={12} md={8}>
                        <Stack direction='column' justifyContent='center' alignItems='center' height='100%' spacing='1rem'>
                            <Paper sx={{ padding: '2rem', textAlign: 'center' }}>
                                <Typography variant='h3'>{type == 'login' ? 'Login' : 'Register'}</Typography>
                                <br />
                                {type == 'login' ?
                                    <LoginIcon fontSize="large" />
                                    :
                                    <RegisterIcon fontSize='large' />
                                }
                                <br />
                                <br />
                                {children}
                            </Paper>
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Stack direction='column' justifyContent='center' sx={{ height: '100%', backgroundImage: 'url(/pattern.png)', borderRadius: desktop ? '1rem 0 0 1rem' : undefined, paddingY: '1rem' }}>
                            <Stack direction='column' justifyContent='center' alignItems='center' spacing='1rem' sx={{ textAlign: 'center' }}>
                                <Typography variant='h3'>
                                    {type == 'login' ?
                                        "Don't have an account?"
                                        :
                                        "Already have an account?"
                                    }
                                </Typography>
                                <UnstyledNextLink href={type == 'login' ? '/register' : '/login'}>
                                    <Button variant='contained' size="large" color='secondary'>
                                        {type == 'login' ?
                                            "Create an account"
                                            :
                                            "Take me to login"
                                        }
                                    </Button>
                                </UnstyledNextLink>
                            </Stack>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>
        </main>
    );
};

export default LoginRegisterTemplate;