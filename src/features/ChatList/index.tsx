import * as React from 'react';
import { Box, Checkbox, CircularProgress, FormControlLabel, FormGroup, IconButton, ListItemButton, Radio, RadioGroup, Stack, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { korisnik } from "@prisma/client";
import useSWR, { KeyedMutator } from 'swr';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Control, Controller, UseFormSetValue, useForm } from "react-hook-form";

import FriendListItem from "../FriendListItem";
import DialogCustomForm from "../../components/Dialogs/CustomForm";
import { ControlledOutlineTextfield } from '../../components/Controlled/ControlledTextfield';
import useErrorAlert from '../../hooks/useErrorAlert';
import { Fetcher, Poster } from "../../lib/Fetcher";

import type { ApiChats, ApiFriends, Chat } from "../../types/apiTypes";

////////////////////////////////////////////////////////////////////////////////////////////

interface ChooseSingleFriendProps {
    control: Control<SingleChatFormData, any>,
};

const ChooseSingleFriend: React.FC<ChooseSingleFriendProps> = ({ control }) => {
    const [search, setSearch] = React.useState("");

    const { data, isLoading, error } = useSWR('/api/friends', Fetcher<ApiFriends>);

    if (isLoading) return <CircularProgress />;
    if (error) return <pre>{JSON.stringify(error)}</pre>;
    if (!data) return <b>Data does not exist!</b>;
    return (
        <>
            <br/>
            <TextField variant='filled' label='Search...' onChange={(e) => setSearch(e.target.value.toLowerCase())} fullWidth />
            <Controller
                control={control}
                name='idSudionik'
                defaultValue={-1}
                render={({ field }) => (
                    <RadioGroup {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                    >
                        {data.map(user => (
                            <Box key={user.idkorisnik} display={user.korisnickoime.toLowerCase().includes(search) ? undefined : 'none'}>
                                <FriendListItem user={user}>
                                    <FormControlLabel value={user.idkorisnik} control={<Radio />} label='' required />
                                </FriendListItem>
                            </Box>
                        ))}
                    </RadioGroup>
                )}
            />
        </>
    );
};

interface ChooseGroupFriendProps {
    setValue: UseFormSetValue<GroupChatFormData>,
};

const ChooseGroupFriends: React.FC<ChooseGroupFriendProps> = ({ setValue }) => {
    const [search, setSearch] = React.useState("");
    const [selected, setSelected] = React.useState<number[]>([]);
    const handleSelect = (id: number, checked: boolean) => {
        if (!checked) {
            setSelected(oldData => oldData.filter(i => i !== id));
        }
        else {
            setSelected(oldData => [id, ...oldData]);
        }
    };

    // Update idSudionici value, checkbox nema nacin kao za RadioGroup
    React.useEffect(() => {
        setValue('idSudionici', selected);
    }, [selected, setValue]);

    const { data, isLoading, error } = useSWR('/api/friends', Fetcher<ApiFriends>);

    if (isLoading) return <CircularProgress />;
    if (error) return <pre>{JSON.stringify(error)}</pre>;
    if (!data) return <b>Data does not exist!</b>;
    return (
        <>
            <br/>
            <TextField variant='filled' label='Search...' onChange={(e) => setSearch(e.target.value.toLowerCase())} fullWidth />
            <FormGroup>
                {data.map(user => (
                    <Box key={user.idkorisnik} display={user.korisnickoime.toLowerCase().includes(search) ? undefined : 'none'}>
                        <FriendListItem user={user}>
                            <FormControlLabel control={<Checkbox onChange={(e, checked) => handleSelect(user.idkorisnik, checked)} />} label='' />
                        </FriendListItem>
                    </Box>
                ))}
            </FormGroup>
        </>
    );
};

////////////////////////////////////////////////////////////////////////////////////////////

export interface SingleChatFormData {
    idSudionik: number,
};

export interface GroupChatFormData {
    nazivGrupe: string,
    idSudionici: number[],
};

export type ChatType = 'single' | 'group';

interface AddChatProps {
    updateChatList: KeyedMutator<ApiChats>,
    checkSingleChatExists: (idSudionik: number) => boolean,
};

const AddChat: React.FC<AddChatProps> = ({ updateChatList, checkSingleChatExists }) => {

    const showError = useErrorAlert();

    const [openDialog, setOpenDialog] = React.useState(false);
    const [typeChat, setTypeChat] = React.useState<ChatType>('single');

    const handleAddChat = () => {
        setOpenDialog(true);
    };

    const singleChat = useForm<SingleChatFormData>();
    const groupChat = useForm<GroupChatFormData>();

    const onSingleChatSubmit = async (data: SingleChatFormData) => {
        // Provjeri ako vec postoji chat izmedu njih te ako postoji samo ga otvori
        if (checkSingleChatExists(data.idSudionik)) return;

        // U suprotnom stvori novi chat
        try {
            const res = await Poster<SingleChatFormData, any>('/api/chats/single', { arg: data });
            await updateChatList();
            singleChat.reset();
        } catch (err) {
            showError(JSON.stringify(err));
        }
    };

    const onGroupChatSubmit = async (data: GroupChatFormData) => {
        if (data.idSudionici.length < 2) {
            showError("At least 2 friends must be chosen to form a group!");
            return;
        }

        try {
            const res = await Poster<GroupChatFormData, any>('/api/chats/group', { arg: data });
            await updateChatList();
            groupChat.reset();
        } catch (err) {
            showError(JSON.stringify(err));
        }
    };

    return (
        <Box>
            <DialogCustomForm
                open={openDialog}
                handleClose={() => setOpenDialog(false)}
                title="Add new chat"
                text=""
                submitText="Add chat"
                submitForForm='form'
            >
                <ToggleButtonGroup
                    onChange={(e, val) => setTypeChat(val)}
                    value={typeChat}
                    exclusive
                    fullWidth
                >
                    <ToggleButton value={'single' as ChatType}>Single</ToggleButton>
                    <ToggleButton value={'group' as ChatType}>Group</ToggleButton>
                </ToggleButtonGroup>
                <br />
                {typeChat == 'single' ?
                    <form onSubmit={singleChat.handleSubmit(onSingleChatSubmit)} id='form'>
                        <ChooseSingleFriend control={singleChat.control} />
                    </form>
                    :
                    <form onSubmit={groupChat.handleSubmit(onGroupChatSubmit)} id='form'>
                        <ChooseGroupFriends setValue={groupChat.setValue} />
                        <br />
                        <ControlledOutlineTextfield control={groupChat.control} name='nazivGrupe' label='Naziv grupe' variant='outlined' fullWidth required />
                    </form>
                }
            </DialogCustomForm>
            <IconButton onClick={handleAddChat}>
                <AddCircleIcon fontSize="large" />
            </IconButton>
        </Box>
    );
};

////////////////////////////////////////////////////////////////////////////////////////////

export interface Props {
    user: korisnik,
    selectChat: (chat: Chat) => void,
};

const ChatList: React.FC<Props> = ({ user, selectChat }) => {

    const [search, setSearch] = React.useState("");

    const checkSingleChatExists = (idSudionik: number) => {
        if (!data || error || isLoading) return true;

        const singleChats = data.filter(chat => chat.pripadarazgovoru.length === 1);
        const singleChat = singleChats.find(chat => chat.pripadarazgovoru[0].idkorisnik === idSudionik);
        
        // Otvori chat s tim userom ako postoji
        if (singleChat) {
            console.log("Chat already exists with user");
            selectChat(singleChat);
        }

        return (singleChat ? true : false);
    };

    const { data, error, isLoading, mutate } = useSWR(`/api/chats`, Fetcher<ApiChats>);

    if (error) return <pre style={{ maxWidth: '200px' }}>{JSON.stringify(error)}</pre>;
    if (!data) return <b>Undefined data error</b>;
    return (
        <Box sx={{ width: 400 }}>
            <Stack direction='row' spacing='1rem' alignItems='center'>
                <TextField variant='filled' label='Search...' onChange={(e) => setSearch(e.target.value.toLowerCase())} fullWidth />
                <AddChat updateChatList={mutate} checkSingleChatExists={checkSingleChatExists} />
            </Stack>
            <br /><br />
            {isLoading ?
                <CircularProgress />
                :
                data.filter(item => item.grupa ? item.nazivGrupe!.toLowerCase().includes(search) : item.pripadarazgovoru[0]!.korisnik.korisnickoime.toLowerCase().includes(search))
                    .map((item, index) => {
                        const korisnik = item.pripadarazgovoru[0].korisnik;
                        // Ako je grupa postavi da je username nazivGrupe i avatarurl od grupe
                        if (item.grupa) {
                            korisnik.korisnickoime = item.nazivGrupe!;
                            korisnik.avatarurl = item.avatarurl;
                        }
                        return (
                            <ListItemButton key={index} onClick={() => selectChat(item)}>
                                <FriendListItem user={korisnik} />
                            </ListItemButton>
                        );
                    })
            }
        </Box>
    );
};

export default ChatList;