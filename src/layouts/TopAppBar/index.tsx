import { AppBar, Toolbar, Box, Typography } from '@mui/material';
import ChatIcon from '@mui/icons-material/MarkChatUnreadSharp';

import { UnstyledNextLink } from '../../components/NextLink';
import { Stack } from '@mui/system';

export interface Props {
    color?: "inherit" | "primary" | "secondary" | "default" | "transparent",
};

/**
 * @param color OPTIONAL color pallet to use 
 */
const TopAppBar: React.FC<Props> = ({ color }) => {

    return (
        <AppBar position="static" color={color}>
            <Toolbar>
                <UnstyledNextLink href={'/'}>
                    <Typography variant='h5' letterSpacing={'0.5rem'} fontStyle={'italic'} sx={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        ChatterBox<ChatIcon />
                    </Typography>
                </UnstyledNextLink>
                <Box flex='1'>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default TopAppBar;
