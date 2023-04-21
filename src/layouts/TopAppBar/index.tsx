import { AppBar, Toolbar, Box, Typography } from '@mui/material';

import { UnstyledNextLink } from '../../components/NextLink';

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
                <Box flex='1'>
                    <UnstyledNextLink href={'/'}>
                        <Typography variant='h5' letterSpacing={'0.5rem'} fontStyle={'italic'}>
                            ChatterBox
                        </Typography>
                    </UnstyledNextLink>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default TopAppBar;
