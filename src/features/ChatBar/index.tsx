/* eslint-disable @next/next/no-img-element */
import * as React from 'react';
import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useForm } from "react-hook-form";
import { korisnik } from '@prisma/client';

import { ControlledOutlineTextfield } from "../../components/Controlled/ControlledTextfield";
import LoadingButton from "../../components/LoadingButton";
import AvatarImage from '../../components/AvatarImage';
import socket from '../../lib/SocketIOClient';
import useColorTheme from '../../hooks/useColorTheme';
import FriendListItem from '../FriendListItem';

import { Chat } from "../../types/apiTypes";
import { IConnectedUser, IMessage } from '../../types';

///////////////////////////////////////////////////////////////////////////////////////////////////////

interface ChatBarHeaderProps {
    selectedChat: Chat,
    closeChat: () => void,
    connectedUsers: IConnectedUser[],
};

const ChatBarHeader: React.FC<ChatBarHeaderProps> = ({ selectedChat, closeChat, connectedUsers }) => {
    const korisnik = selectedChat.pripadarazgovoru[0].korisnik;
    // Ako je grupa postavi da je username nazivGrupe i avatarurl od grupe
    if (selectedChat.grupa) {
        korisnik.korisnickoime = selectedChat.nazivGrupe!;
        korisnik.avatarurl = selectedChat.avatarurl!;
    }

    if (selectedChat.grupa) return (
        <Box sx={{ my: '1rem', mr: 2 }}>
            <FriendListItem user={korisnik}>
                <IconButton onClick={closeChat}>
                    <CloseIcon fontSize="large" />
                </IconButton>
                <IconButton>
                    <MoreVertIcon fontSize="large" />
                </IconButton>
            </FriendListItem>
        </Box>
    );
    else {
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
};

const ChatBar: React.FC<Props> = ({ user, selectedChat, closeChat, connectedUsers }) => {

    const [messages, setMessages] = React.useState<IMessage[]>([]);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    // subscribe to socket events and connect
    React.useEffect(() => {
        socket.emit("joinChat", selectedChat.idrazgovor);

        socket.on('message', (msg: IMessage) => {
            setMessages(oldMessages => [...oldMessages, msg]);
        });

        // Reset saved messages from previously open chat
        setMessages([]);

        return () => {
            socket.off('message');
        };
    }, [user, setMessages, selectedChat]);

    // Scroll to new message
    React.useEffect(() => {
        if (!messagesEndRef.current) return;
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        console.log("Scrolling to new message");
    }, [messages]);

    // On message send
    const { control, handleSubmit, reset } = useForm<AddChatFormData>();
    const onSubmit = (data: AddChatFormData) => {
        reset();
        socket.emit('message', {
            idChat: selectedChat!.idrazgovor,
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
                            backgroundColor: (msg.posiljatelj.idkorisnik === user.idkorisnik) ? theme.palette.primary.main : undefined,
                            ml: (msg.posiljatelj.idkorisnik === user.idkorisnik) ? 'auto' : 0
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