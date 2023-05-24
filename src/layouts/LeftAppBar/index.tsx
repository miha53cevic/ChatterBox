import { AppBar, Toolbar, Box, Stack, IconButton } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import HomeIcon from '@mui/icons-material/Home';
import StarIcon from '@mui/icons-material/Star';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import FriendsIcon from '@mui/icons-material/People';

import { UnstyledNextLink } from '../../components/NextLink';

export interface Props {
    color?: "inherit" | "primary" | "secondary" | "default" | "transparent",
};

const LeftAppBar: React.FC<Props> = ({ color }) => {
    
    return (
        <AppBar position="sticky" color={color} sx={{ minHeight: '100vh' }}>
            <Toolbar sx={{ minHeight: '100vh' }}>
                <Stack direction='column' justifyContent='center' alignItems='center' spacing='1.5rem' paddingY='2rem' minHeight='100vh'>
                    <UnstyledNextLink href={'/app'}>
                        <IconButton>
                            <HomeIcon fontSize='large' />
                        </IconButton>
                    </UnstyledNextLink>
                    <UnstyledNextLink href={'/app/chat'}>
                        <IconButton>
                            <ChatIcon fontSize='large' />
                        </IconButton>
                    </UnstyledNextLink>
                    <UnstyledNextLink href={'/app/friends'}>
                        <IconButton>
                            <FriendsIcon fontSize='large' />
                        </IconButton>
                    </UnstyledNextLink>

                    <Box flex='1'></Box>

                    <UnstyledNextLink href={'/app/settings'}>
                        <IconButton>
                            <SettingsIcon fontSize='large' />
                        </IconButton>
                    </UnstyledNextLink>
                    <UnstyledNextLink href={'/logout'}>
                        <IconButton>
                            <LogoutIcon fontSize='large' />
                        </IconButton>
                    </UnstyledNextLink>
                </Stack>
            </Toolbar>
        </AppBar>
    );
}

export default LeftAppBar;
