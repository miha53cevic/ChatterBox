import React, { useEffect, useRef, useState } from "react";
import { Button, IconButton, Stack, TextareaAutosize, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import AddIcon from '@mui/icons-material/Add';
import useSWRMutation from 'swr/mutation';

import DialogFullscreen from "../../components/Dialogs/Fullscreen";
import { ControlledOutlineTextfield } from "../../components/Controlled/ControlledTextfield";
import { Fetcher, Poster } from "../../lib/Fetcher";
import FriendListItem from "../FriendListItem";

import type { ApiUsersWithSimiliarName } from "../../types/apiTypes";
import useErrorAlert from "../../hooks/useErrorAlert";
import DialogCustomForm from "../../components/Dialogs/CustomForm";

export interface SearchResultProps {
    data: ApiUsersWithSimiliarName,
    mutate: any,
    search: string,
};

const SearchResult: React.FC<SearchResultProps> = ({ data, mutate, search }) => {

    const showError = useErrorAlert();

    const { trigger } = useSWRMutation('/api/friend_requests', Poster<{ idPrimatelj: number, poruka: string }>);
    const [primatelj, setPrimatelj] = useState<number>();
    const handleSendRequest = async () => {
        if (!primatelj || !optionalMsgRef.current) return;
        try {
            await trigger({ idPrimatelj: primatelj, poruka: optionalMsgRef.current.value });
            // Trigger update data in AddFriend
            await mutate();
        } catch (error) {
            showError(JSON.stringify(error));
        }
    };

    const [openRequestDialog, setOpenRequestDialog] = useState(false);
    const handleAddButton = async (idPrimatelj: number) => {
        setPrimatelj(idPrimatelj);
        setOpenRequestDialog(true);
    };

    const optionalMsgRef = useRef<HTMLTextAreaElement>(null);
    return (
        <>
            <DialogCustomForm
                open={openRequestDialog}
                handleClose={() => setOpenRequestDialog(false)}
                title="Send friend request"
                text=""
                submitText="Send"
                submitAction={handleSendRequest}
            >
                <TextareaAutosize ref={optionalMsgRef} placeholder="Optional message..." style={{ width: '300px', height: '10rem' }} />
            </DialogCustomForm>
            {data.map(({ user, nazivstatus }, index) => (
                <React.Fragment key={index}>
                    <FriendListItem user={user}>
                        {!nazivstatus ?
                            <IconButton onClick={() => handleAddButton(user.idkorisnik)}>
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
            {!data.length && search != '' && <Typography>No user found</Typography>}
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
                <SearchResult data={data || []} mutate={trigger} search={search} />
            </DialogFullscreen>
            <Stack direction='row' justifyContent='flex-end'>
                <Button variant='contained' onClick={() => setOpenDialog(true)}>Add friend</Button>
            </Stack>
        </>
    );
};

export default AddFriend;