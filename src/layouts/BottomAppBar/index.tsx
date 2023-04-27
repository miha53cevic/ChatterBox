import { AppBar, Toolbar, Box, Stack, IconButton } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import StarIcon from '@mui/icons-material/Star';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import FriendsIcon from '@mui/icons-material/People';

import { UnstyledNextLink } from '../../components/NextLink';

export interface Props {
    color?: "inherit" | "primary" | "secondary" | "default" | "transparent",
};

const BottomAppBar: React.FC<Props> = ({ color }) => {
    
    return (
        <AppBar position="sticky" color={color} sx={{ width: '100%' }}>
            <Toolbar sx={{ width: '100%' }}>
                <Stack direction='row' justifyContent='center' alignItems='center' spacing='1.5rem' paddingX='2rem' width='100%'>
                    <UnstyledNextLink href={'/app'}>
                        <IconButton>
                            <FriendsIcon fontSize='small' />
                        </IconButton>
                    </UnstyledNextLink>
                    <IconButton>
                        <StarIcon fontSize='small' />
                    </IconButton>
                    <IconButton>
                        <ChatIcon fontSize='large' />
                    </IconButton>
                    <UnstyledNextLink href={'/settings'}>
                        <IconButton>
                            <SettingsIcon fontSize='small' />
                        </IconButton>
                    </UnstyledNextLink>
                    <UnstyledNextLink href={'/logout'}>
                        <IconButton>
                            <LogoutIcon fontSize='small' />
                        </IconButton>
                    </UnstyledNextLink>
                </Stack>
            </Toolbar>
        </AppBar>
    );
}

export default BottomAppBar;
