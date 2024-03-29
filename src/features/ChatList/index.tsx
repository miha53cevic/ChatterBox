import * as React from 'react';
import { Box, Checkbox, CircularProgress, FormControlLabel, FormGroup, IconButton, ListItemButton, Radio, RadioGroup, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { korisnik, razgovor } from "@prisma/client";
import useSWR, { KeyedMutator } from 'swr';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import { Control, Controller, UseFormSetValue, useForm } from "react-hook-form";

import FriendListItem from "../FriendListItem";
import DialogCustomForm from "../../components/Dialogs/CustomForm";
import { ControlledOutlineTextfield } from '../../components/Controlled/ControlledTextfield';
import useErrorAlert from '../../hooks/useErrorAlert';
import { Fetcher, Poster } from "../../lib/Fetcher";

import type { ApiChats, ApiFriends, Chat } from "../../types/apiTypes";
import { IConnectedUser, INotification } from '../../types';

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
            <br />
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

export const ChooseGroupFriends: React.FC<ChooseGroupFriendProps> = ({ setValue }) => {
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
            <br />
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
            const res = await Poster<SingleChatFormData, razgovor>('/api/chats/single', { arg: data });
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
            const res = await Poster<GroupChatFormData, razgovor>('/api/chats/group', { arg: data });
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
    connectedUsers: IConnectedUser[],
    notifications: INotification[],
};

const ChatList: React.FC<Props> = ({ user, selectChat, connectedUsers, notifications }) => {

    const [search, setSearch] = React.useState("");

    const [chatFilters, setChatFilters] = React.useState<ChatType | null>(null);
    const handleChatFilters = (e: React.MouseEvent<HTMLElement>, newFilters: ChatType) => {
        setChatFilters(newFilters);
    };

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
        <Box sx={{ width: 400, maxWidth: 400 }}>
            <Stack direction='row' spacing='1rem' alignItems='center'>
                <TextField variant='filled' label='Search...' onChange={(e) => setSearch(e.target.value.toLowerCase())} fullWidth />
                <AddChat updateChatList={mutate} checkSingleChatExists={checkSingleChatExists} />
            </Stack>
            <Typography variant='caption'>Filters</Typography>
            <ToggleButtonGroup
                value={chatFilters}
                onChange={handleChatFilters}
                exclusive
                fullWidth
            >
                <ToggleButton value={'single' as ChatType}><PersonIcon /></ToggleButton>
                <ToggleButton value={'group' as ChatType}><GroupIcon /></ToggleButton>
            </ToggleButtonGroup>
            <br />
            {isLoading ?
                <CircularProgress />
                :
                data.filter(item => item.grupa ? item.nazivGrupe!.toLowerCase().includes(search) : item.pripadarazgovoru[0]!.korisnik.korisnickoime.toLowerCase().includes(search))
                    .filter(item => !chatFilters ? item : (chatFilters == 'single' ? item.grupa == false : item.grupa == true))
                    .map((item, index) => {
                        const korisnik = item.pripadarazgovoru[0].korisnik;
                        // Ako je grupa postavi da je username nazivGrupe i avatarurl od grupe
                        if (item.grupa) {
                            korisnik.korisnickoime = item.nazivGrupe!;
                            korisnik.avatarurl = item.avatarurl;
                        }
                        const notification = notifications.find(n => n.idChat === item.idrazgovor);
                        if (item.grupa) return (
                            <ListItemButton key={index} onClick={() => selectChat(item)}>
                                <FriendListItem user={korisnik} />
                                {notification ?
                                    <Typography sx={{ backgroundColor: 'red', width: '2rem', textAlign: 'center', color: 'white', borderRadius: '0.5rem' }}>
                                        {notification.unreadCount}
                                    </Typography>
                                    : null
                                }
                            </ListItemButton>
                        );
                        else {
                            const connectedUser = connectedUsers.find(i => i.user.idkorisnik === korisnik.idkorisnik);
                            const status = connectedUser ? connectedUser.status : 'offline';
                            return (
                                <ListItemButton key={index} onClick={() => selectChat(item)}>
                                    <FriendListItem user={korisnik} userStatus={status} />
                                    {notification ?
                                        <Typography sx={{ backgroundColor: 'red', width: '2rem', textAlign: 'center', color: 'white', borderRadius: '0.5rem' }}>
                                            {notification.unreadCount}
                                        </Typography>
                                        : null
                                    }
                                </ListItemButton>
                            );
                        }
                    })
            }
        </Box>
    );
};

export default ChatList;