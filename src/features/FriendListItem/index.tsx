import { Stack, Box, Typography } from "@mui/material";
import { korisnik } from "@prisma/client";
import AvatarImage from "../../components/AvatarImage";

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
            <AvatarImage url={user.avatarurl} />
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