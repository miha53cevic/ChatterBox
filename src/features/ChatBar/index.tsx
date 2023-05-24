import * as React from 'react';
import { Box, IconButton, Paper, Stack, TextField, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import AddPersonIcon from '@mui/icons-material/PersonAddAlt1';
import LeaveGroupIcon from '@mui/icons-material/ExitToApp';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import AddPhoto from '@mui/icons-material/AddPhotoAlternate';
import CancelIcon from '@mui/icons-material/Cancel';
import { useForm } from "react-hook-form";
import { korisnik } from '@prisma/client';
import { mutate } from 'swr';

import { ControlledOutlineTextfield } from "../../components/Controlled/ControlledTextfield";
import LoadingButton from "../../components/LoadingButton";
import AvatarImage from '../../components/AvatarImage';
import socket from '../../lib/SocketIOClient';
import useColorTheme from '../../hooks/useColorTheme';
import FriendListItem from '../FriendListItem';
import { Deleter, Fetcher, Poster } from '../../lib/Fetcher';
import useErrorAlert from '../../hooks/useErrorAlert';
import DialogCustomForm from '../../components/Dialogs/CustomForm';
import { ChooseGroupFriends, GroupChatFormData } from '../ChatList';

import { ApiGetForChatMessages, Chat } from "../../types/apiTypes";
import { IConnectedUser, IMessage } from '../../types';

///////////////////////////////////////////////////////////////////////////////////////////////////////

interface ChatBarHeaderProps {
    selectedChat: Chat,
    closeChat: () => void,
    connectedUsers: IConnectedUser[],
};

const ChatBarHeader: React.FC<ChatBarHeaderProps> = ({ selectedChat, closeChat, connectedUsers }) => {

    const showError = useErrorAlert();

    ///////////////////////////////////////////////////////////////////////////////////////
    React.useEffect(() => {
        setDisplayGroupName(selectedChat.nazivGrupe);
    }, [selectedChat]);

    const [editGroupName, setEditGroupName] = React.useState(false);
    const [displayGroupName, setDisplayGroupName] = React.useState(selectedChat.nazivGrupe);
    const [newGroupName, setNewGroupName] = React.useState("");
    const handleGroupNameChange = async () => {
        setEditGroupName(false);
        try {
            const res = await Poster('/api/group/changeName', { arg: { idGroup: selectedChat.idrazgovor, newGroupName: newGroupName } });
            mutate('/api/chats');
            setDisplayGroupName(newGroupName);
        } catch (err) {
            console.error(err);
            showError("Couldn't change group name!");
        }
    };
    const handleGroupLeave = async () => {
        try {
            const res = await Deleter(`/api/group/leaveGroup/${selectedChat.idrazgovor}`)
            mutate('/api/chats');
            closeChat();
        } catch (err) {
            console.error(err);
            showError("Error on leaveing group, please try again!");
        }
    };
    const [openDialog, setOpenDialog] = React.useState(false);
    const addSudionik = useForm<GroupChatFormData>();
    const handleAddSudionik = async (data: GroupChatFormData) => {
        if (data.idSudionici.length < 1) return;

        for (const i of data.idSudionici) {
            if (selectedChat.pripadarazgovoru.some(r => r.idkorisnik === i)) {
                const korisnik = selectedChat.pripadarazgovoru.filter(user => user.idkorisnik === i);
                showError(`User: ${korisnik[0].korisnik.korisnickoime} is already in group chat!`);
                return;
            }
        }

        try {
            const res = await Poster('/api/group/addUsersToGroup', { arg: { idGroup: selectedChat.idrazgovor, idUsers: data.idSudionici } });
        } catch(err) {
            console.error(err);
            showError("Error on adding a new friend to group chat, try again later.");
        }
    };
    ///////////////////////////////////////////////////////////////////////////////////////

    if (selectedChat.grupa) {
        return (
            <>
                <DialogCustomForm
                    open={openDialog}
                    handleClose={() => setOpenDialog(false)}
                    title="Add new friend to chat"
                    text=""
                    submitText="Add friend to chat"
                    submitForForm='form'
                >
                    <form onSubmit={addSudionik.handleSubmit(handleAddSudionik)} id='form'>
                        <ChooseGroupFriends setValue={addSudionik.setValue} />
                    </form>
                </DialogCustomForm>
                <Box sx={{ my: '1rem', mr: 2 }}>
                    <Stack direction='row' sx={{ my: '1rem', mr: 2, width: '100%' }} spacing='1rem'>
                        <AvatarImage url={selectedChat.avatarurl} />
                        <Stack direction='row' flex='1' alignSelf='center' spacing='1rem'>
                            {editGroupName ?
                                <>
                                    <TextField variant='standard' defaultValue={displayGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
                                    <IconButton onClick={() => handleGroupNameChange()}>
                                        <CheckIcon />
                                    </IconButton>
                                    <IconButton onClick={() => setEditGroupName(false)}>
                                        <CancelIcon />
                                    </IconButton>
                                </>
                                :
                                <>
                                    <Typography variant='h4'>{displayGroupName}</Typography>
                                    <IconButton onClick={() => setEditGroupName(true)}>
                                        <EditIcon />
                                    </IconButton>
                                </>
                            }
                        </Stack>
                        <Stack direction='row' alignItems='center' spacing='1rem'>
                            <IconButton onClick={() => setOpenDialog(true)}>
                                <AddPersonIcon fontSize="large" />
                            </IconButton>
                            <IconButton>
                                <AddPhoto fontSize='large' />
                            </IconButton>
                            <IconButton onClick={handleGroupLeave}>
                                <LeaveGroupIcon fontSize='large' />
                            </IconButton>
                            <IconButton onClick={closeChat}>
                                <CloseIcon fontSize="large" />
                            </IconButton>
                        </Stack>
                    </Stack>
                </Box>
            </>
        );
    } else {
        const korisnik = selectedChat.pripadarazgovoru[0].korisnik;
        const connectedUser = connectedUsers.find(i => i.user.idkorisnik === korisnik.idkorisnik);
        const status = connectedUser ? connectedUser.status : 'offline';
        return (
            <Box sx={{ my: '1rem', mr: 2 }}>
                <FriendListItem user={korisnik} userStatus={status}>
                    <IconButton onClick={closeChat}>
                        <CloseIcon fontSize="large" />
                    </IconButton>
                </FriendListItem>
            </Box>
        );
    }
};

///////////////////////////////////////////////////////////////////////////////////////////////////////

export interface AddChatFormData {
    message: string,
};

export interface Props extends ChatBarHeaderProps {
    user: korisnik,
    readAllInChat: (idChat: number) => void,
};

const ChatBar: React.FC<Props> = ({ user, selectedChat, closeChat, connectedUsers, readAllInChat }) => {

    const [messages, setMessages] = React.useState<IMessage[]>([]);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    ////////////////////////////////////////////////////////////////////////////////////////

    // Get all messages from db
    React.useEffect(() => {
        // Reset saved messages from previously open chat
        setMessages([]);

        (async () => {
            try {
                const messages = await Fetcher<ApiGetForChatMessages>(`/api/messages/${selectedChat.idrazgovor}`);
                const formatedMessages = messages.map(msg => ({
                    idChat: msg.idrazgovor,
                    idMsg: msg.idporuka,
                    posiljatelj: msg.korisnik,
                    tekst: msg.tekst,
                    timestamp: new Date(msg.timestamp as unknown as string).toLocaleString(),
                } as IMessage));
                setMessages([...formatedMessages]);
            } catch (err) {
                console.error(err);
            }
        })();
    }, [selectedChat]);

    // subscribe to messages received & add new real time messages
    React.useEffect(() => {
        // Join room just in case it's a newly created one
        socket.emit('joinChat', selectedChat.idrazgovor);

        const saveReceivedMessage = async (msg: IMessage) => {
            // Check if this is a message for selectedChat
            if (msg.idChat === selectedChat.idrazgovor) {
                setMessages(oldMessages => [...oldMessages, msg]);
            }
        };
        socket.on('message', saveReceivedMessage);

        return () => {
            socket.off('message', saveReceivedMessage); // makni samo ovaj listener na message, a ne i sve
        };
    }, [user, selectedChat]);

    // Scroll to new message
    React.useEffect(() => {
        if (!messagesEndRef.current) return;
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        console.log("Scrolling to new message");
    }, [messages, selectedChat]);

    // Set last message
    React.useEffect(() => {
        if (messages.length === 0) return;
        (async () => {
            // Postavi da je to lastReadMessage na incomin message dok je taj chat window otvoren
            try {
                const lastMessage = messages[messages.length - 1];
                await Poster('/api/last_read_message/', { arg: { idChat: lastMessage.idChat, idPoruka: lastMessage.idMsg } })
            } catch(err) {
                console.error(err);
            }
            // Remove all notifications (all messages are read)
            readAllInChat(messages[0].idChat);
        })();
    }, [messages, readAllInChat]);

    ////////////////////////////////////////////////////////////////////////////////////////

    // On message send
    const { control, handleSubmit, reset } = useForm<AddChatFormData>();
    const onSubmit = (data: AddChatFormData) => {
        reset();
        socket.emit('message', {
            idChat: selectedChat.idrazgovor,
            idMsg: -1, // later set to real id in socketServer
            tekst: data.message,
            posiljatelj: user,
            timestamp: new Date().toLocaleString(),
        } as IMessage);
    };

    const theme = useColorTheme().getTheme();
    return (
        <Stack direction='column' height='100%' maxHeight='100vh'>
            <Paper sx={{ px: '2rem' }}>
                <ChatBarHeader selectedChat={selectedChat} closeChat={closeChat} connectedUsers={connectedUsers} />
            </Paper>
            <Box flex='1' sx={{ padding: '2rem', overflowY: 'auto' }}>
                {messages.map((msg, i) => (
                    <React.Fragment key={i}>
                        <Paper sx={{
                            padding: '1rem', width: 'fit-content', borderRadius: '1rem',
                            backgroundColor: (msg.posiljatelj.idkorisnik === user.idkorisnik) ? theme.palette.primary.main : undefined, // boja korisnikovih poruka je prema themu
                            ml: (msg.posiljatelj.idkorisnik === user.idkorisnik) ? 'auto' : 0 // poruke trenutnog usera su na desnoj strani, ostali na ljevoj
                        }}
                        >
                            <Stack direction='row' spacing='1rem'>
                                <AvatarImage url={msg.posiljatelj.avatarurl} width='64px' height='64px' />
                                <Stack direction='column' sx={{ maxWidth: 'calc(100vw / 3)' }}>
                                    <Typography variant='caption'>
                                        {msg.timestamp}
                                    </Typography>
                                    <Typography variant='body1' fontWeight='bold' style={{ wordWrap: 'break-word' }}>
                                        {msg.posiljatelj.korisnickoime}
                                    </Typography>
                                    <Stack direction='column' justifyContent='center' flex='1'>
                                        <Typography variant='body2' style={{ wordWrap: 'break-word' }}>
                                            {msg.tekst}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Paper>
                        <br />
                    </React.Fragment>
                ))}
                <div id='messagesEnd' ref={messagesEndRef}></div>
            </Box>
            <Paper sx={{ padding: '2rem', overflowY: 'auto' }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack direction='row'>
                        <ControlledOutlineTextfield control={control} name="message" variant="outlined" label='Message' multiline fullWidth required />
                        <LoadingButton variant="contained" loading={false} type="submit"><ChatBubbleIcon /></LoadingButton>
                    </Stack>
                </form>
            </Paper>
        </Stack>
    );
};

export default ChatBar;