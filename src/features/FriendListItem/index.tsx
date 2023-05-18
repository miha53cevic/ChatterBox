import { Stack, Box, Typography } from "@mui/material";
import { korisnik } from "@prisma/client";
import AvatarImage from "../../components/AvatarImage";

import { IUserStatus } from "../../types";

export interface Props {
    user: korisnik,
    userStatus?: IUserStatus,
    children?: React.ReactNode,
};

/**
 * @param user - korisnik data
 * @param userStatus - OPTIONAL user status
 * @param children - OPTIONAL button at the end of the listItem example. deleteIcon etc.
 */
const FriendListItem: React.FC<Props> = ({ user, userStatus, children }) => {
    return (
        <Stack direction='row' sx={{ my: '1rem', mr: 2, width: '100%' }} spacing='1rem'>
            <AvatarImage url={user.avatarurl} />
            <Box flex='1' alignSelf='center'>
                    <Typography variant='h4'>{user.korisnickoime}</Typography>
                    {userStatus ?
                        <Stack direction='row' alignItems='center' gap='0.5rem'>
                            <Box sx={{ width: '10px', height: '10px', borderRadius: '50%',
                                backgroundColor: userStatus === 'online' ? 'green' : (userStatus === 'offline' ? 'grey' : 'orange') , 
                            }}></Box>
                            {userStatus}
                        </Stack>
                        : null
                    }
            </Box>
            <Stack direction='row' alignItems='center' spacing='1rem'>
                {children}
            </Stack>
        </Stack>
    );
};

export default FriendListItem;