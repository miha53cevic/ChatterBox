import { Box, Button, Grid, Paper, Stack, Typography } from "@mui/material";
import PageContent from "../layouts/PageContent";
import TopAppBar from "../layouts/TopAppBar";


const Login = () => {
    return (
        <main>
            <TopAppBar />
            <Box sx={{ minHeight: '100vh' }}>
                <Grid container sx={{ minHeight: '100vh' }}>
                    <Grid item xs={12} md={8}>
                        <Stack direction='column' justifyContent='center' alignItems='center' height='100%' spacing='1rem'>
                            <Typography variant='h3'>Login</Typography>
                            <Paper sx={{ padding: '1rem' }}>
                                <Stack direction='column'>
                                    Username
                                    Password
                                </Stack>
                            </Paper>
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Stack direction='column' justifyContent='center' sx={{ background: "radial-gradient(263px at 100.2% 3%, rgb(12, 85, 141) 31.1%, rgb(205, 181, 93) 36.4%, rgb(244, 102, 90) 50.9%, rgb(199, 206, 187) 60.7%, rgb(249, 140, 69) 72.5%, rgb(12, 73, 116) 72.6%); ", height: '100%' }}>
                            <Stack direction='column' justifyContent='center' alignItems='center' spacing='1rem'>
                                <Typography variant='h3'>
                                    Are you new here?
                                </Typography>
                                <Button variant='contained' size="large">
                                    Sign up
                                </Button>
                            </Stack>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>
        </main>
    );
};

export default Login;