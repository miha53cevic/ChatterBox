import { Button, Grid, Stack, Typography } from '@mui/material';

import TopAppBar from '../layouts/TopAppBar';
import PageContent from '../layouts/PageContent';
import { UnstyledNextLink } from '../components/NextLink';

const Index = () => {
    return (
        <main>
            <TopAppBar />
            <PageContent my='2rem'>
                <Grid container spacing='1rem'>
                    <Grid item xs={12} md={6}>
                        <Typography variant='h1'>Chat from anywhere</Typography>
                        <br/>
                        <Stack direction='row' spacing='1rem'>
                            <Button variant='contained'>
                                <UnstyledNextLink href='/register'>
                                    Start messaging!
                                </UnstyledNextLink>
                            </Button>
                            <Button variant='outlined'>
                                <UnstyledNextLink href='/login'>
                                    Already haven an account?
                                </UnstyledNextLink>
                            </Button>
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <img src='https://picsum.photos/600/400' 
                            loading='lazy'
                            width='100%' 
                            height='100%' 
                            style={{ objectFit: 'contain' }} 
                        />
                    </Grid>
                </Grid>
            </PageContent>
        </main>
    );
};

export default Index;