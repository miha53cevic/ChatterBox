/* eslint-disable @next/next/no-img-element */
import { Stack, Box, Typography } from "@mui/material";
import { korisnik } from "@prisma/client";

export interface Props {
    user: korisnik,
    children?: React.ReactNode,
};

/**
 * @param user - korisnik data
 * @param children - OPTIONAL button at the end of the listItem example. deleteIcon etc.
 */
const FriendListItem: React.FC<Props> = ({ user, children }) => {
    return (
        <Stack direction='row' sx={{ my: '1rem', mr: 2, width: '100%' }} spacing='1rem'>
            <img src={user.avatarurl || 'https://picsum.photos/200'} 
                width='100px' 
                height='100px' 
                loading="lazy" alt="user_avatar"
                style={{ borderRadius: '50%', border: 'solid black' }}
            />
            <Box flex='1' alignSelf='center'>
                <Typography variant='h4'>{user.korisnickoime}</Typography>
            </Box>
            <Stack direction='row' alignItems='center' spacing='1rem'>
                {children}
            </Stack>
        </Stack>
    );
};

export default FriendListItem;