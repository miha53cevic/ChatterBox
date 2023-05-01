import React, { useEffect, useState } from "react";
import { Button, IconButton, Stack, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import AddIcon from '@mui/icons-material/Add';
import useSWRMutation from 'swr/mutation';

import DialogFullscreen from "../../components/Dialogs/Fullscreen";
import { ControlledOutlineTextfield } from "../../components/Controlled/ControlledTextfield";
import { Fetcher, Poster } from "../../lib/Fetcher";
import FriendListItem from "../FriendListItem";

import type { ApiUsersWithSimiliarName } from "../../types/apiTypes";
import useErrorAlert from "../../hooks/useErrorAlert";

export interface SearchResultProps {
    data: ApiUsersWithSimiliarName,
    mutate: any,
};

const SearchResult: React.FC<SearchResultProps> = ({ data, mutate }) => {

    const showError = useErrorAlert();

    const { trigger } = useSWRMutation('/api/friend_requests', Poster<{ idPrimatelj: number }>);
    const handleSendFriendRequest = async (idPrimatelj: number) => {
        try {
            await trigger({ idPrimatelj: idPrimatelj });
            // Trigger update data in AddFriend
            await mutate();
        } catch(error) {
            showError(JSON.stringify(error));
        }
    };

    // TODO - kratka poruka tjekom slanja

    return (
        <>
            {data.map(({ user, nazivstatus }, index) => (
                <React.Fragment key={index}>
                    <FriendListItem user={user}>
                        {!nazivstatus ?
                            <IconButton onClick={() => handleSendFriendRequest(user.idkorisnik)}>
                                <AddIcon fontSize="large" />
                            </IconButton>
                            :
                            <Typography sx={{ color: nazivstatus == 'awaiting confirmation' ? 'orange' : (nazivstatus == 'accepted' ? 'green' : 'red') }}>
                                {nazivstatus}
                            </Typography>
                        }
                    </FriendListItem>
                    <hr />
                </React.Fragment>
            ))}
        </>
    );
};

////////////////////////////////////////////////////////////////////

interface FriendSearchData {
    search: string,
};

const AddFriend: React.FC = () => {

    const [search, setSearch] = useState("");
    const { trigger, data } = useSWRMutation(`/api/users/${search}`, Fetcher<ApiUsersWithSimiliarName>);
    // Get data when search string is updated and isn't empty
    useEffect(() => {
        if (search == "") return;
        trigger()
            .catch(err => console.error(err));
    }, [search, trigger]);

    // Get search string from form
    const { control, handleSubmit } = useForm<FriendSearchData>();
    const onSubmit = async ({ search }: FriendSearchData) => {
        setSearch(search);
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
                <SearchResult data={data || []} mutate={trigger} />
            </DialogFullscreen>
            <Stack direction='row' justifyContent='flex-end'>
                <Button variant='contained' onClick={() => setOpenDialog(true)}>Add friend</Button>
            </Stack>
        </>
    );
};

export default AddFriend;