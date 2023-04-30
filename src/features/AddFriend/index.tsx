import React, { useState } from "react";
import { Button, IconButton, Stack } from "@mui/material";
import { useForm } from "react-hook-form";
import { korisnik } from "@prisma/client";
import AddIcon from '@mui/icons-material/Add';

import DialogFullscreen from "../../components/Dialogs/Fullscreen";
import { ControlledOutlineTextfield } from "../../components/Controlled/ControlledTextfield";
import { Fetcher } from "../../lib/Fetcher";
import FriendListItem from "../FriendListItem";

interface FriendSearchData {
    search: string,
};

const SearchResult: React.FC<{ users: korisnik[] }> = ({ users }) => {

    const handleSendFriendRequest = () => {
        
    };

    return (
        <>
            {users.map((user, index) => (
                <React.Fragment key={index}>
                    <FriendListItem user={user}>
                        <IconButton onClick={handleSendFriendRequest}>
                            <AddIcon fontSize="large" />
                        </IconButton>
                    </FriendListItem>
                    <hr />
                </React.Fragment>
            ))}
        </>
    );
};

////////////////////////////////////////////////////////////////////

const AddFriend: React.FC = () => {

    const [users, setUsers] = useState<korisnik[]>([]);

    const { control, handleSubmit } = useForm<FriendSearchData>();
    const onSubmit = async (data: FriendSearchData) => {
        try {
            const users = await Fetcher<korisnik[]>(`/api/users/${data.search}`);
            setUsers(users);
        } catch(err) {
            console.error(err);
        }
    };

    const [openDialog, setOpenDialog] = useState(false);
    return (
        <>
            <DialogFullscreen
                open={openDialog}
                handleClose={() => setOpenDialog(false)}
                buttonOptions={{ hidden: true }}
                title="Add friend"
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack direction='row' spacing='1rem'>
                        <ControlledOutlineTextfield control={control} name="search" variant="outlined" label="Username..." />
                        <Button variant="contained" type='submit'>Search</Button>
                    </Stack>
                </form>
                <br />
                <SearchResult users={users} />
            </DialogFullscreen>
            <Stack direction='row' justifyContent='flex-end'>
                <Button variant='contained' onClick={() => setOpenDialog(true)}>Add friend</Button>
            </Stack>
        </>
    );
};

export default AddFriend;