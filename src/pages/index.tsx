import { Button, Grid, Stack, Typography } from '@mui/material';

import TopAppBar from '../layouts/TopAppBar';
import PageContent from '../layouts/PageContent';
import { UnstyledNextLink } from '../components/NextLink';
import useDesktop from '../hooks/useDesktop';

const Index = () => {

    const desktop = useDesktop();
    
    return (
        <main>
            <TopAppBar />
            <PageContent my='2rem' centerY>
                <Grid container spacing='1rem'>
                    <Grid item xs={12} md={6} sx={{ textAlign: desktop ? undefined : 'center' }}>
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
                        <img src='/frontpage_screenshot.png' 
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