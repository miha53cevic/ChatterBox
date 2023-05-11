/* eslint-disable @next/next/no-img-element */
import * as React from 'react';
import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import { Chat } from "../../types/apiTypes";
import { ControlledOutlineTextfield } from "../../components/Controlled/ControlledTextfield";
import { useForm } from "react-hook-form";
import LoadingButton from "../../components/LoadingButton";
import socket from '../../lib/SocketIOClient';
import { korisnik } from '@prisma/client';

///////////////////////////////////////////////////////////////////////////////////////////////////////

interface ChatBarHeaderProps {
    selectedChat: Chat,
    closeChat: () => void,
};

const ChatBarHeader: React.FC<ChatBarHeaderProps> = ({ selectedChat, closeChat }) => {

    if (selectedChat.grupa) return (
        <Stack direction='row' sx={{ my: '1rem', mr: 2, width: '100%' }} spacing='1rem'>
            <img src={selectedChat.avatarurl || 'https://picsum.photos/200'}
                width='100px'
                height='100px'
                loading="lazy" alt="user_avatar"
                style={{ borderRadius: '50%', border: 'solid black' }}
            />
            <Box flex='1' alignSelf='center'>
                <Typography variant='h4'>{selectedChat.nazivGrupe}</Typography>
            </Box>
            <Stack direction='row' alignItems='center' spacing='1rem'>
                <IconButton onClick={closeChat}>
                    <CloseIcon fontSize="large" />
                </IconButton>
                <IconButton>
                    <MoreVertIcon fontSize="large" />
                </IconButton>
            </Stack>
        </Stack>
    );
    else return (
        <Stack direction='row' sx={{ my: '1rem', mr: 2, width: '100%' }} spacing='1rem'>
            <img src={selectedChat.pripadarazgovoru[0].korisnik.avatarurl || 'https://picsum.photos/200'}
                width='100px'
                height='100px'
                loading="lazy" alt="user_avatar"
                style={{ borderRadius: '50%', border: 'solid black' }}
            />
            <Box flex='1' alignSelf='center'>
                <Typography variant='h4'>{selectedChat.pripadarazgovoru[0].korisnik.korisnickoime}</Typography>
            </Box>
            <Stack direction='row' alignItems='center' spacing='1rem'>
                <IconButton onClick={closeChat}>
                    <CloseIcon fontSize="large" />
                </IconButton>
            </Stack>
        </Stack>
    );
};

///////////////////////////////////////////////////////////////////////////////////////////////////////

export interface AddChatFormData {
    message: string,
};

export interface Props {
    user: korisnik,
    selectedChat: Chat | null,
    closeChat: () => void,
};

const ChatBar: React.FC<Props> = ({ user, selectedChat, closeChat }) => {

    React.useEffect(() => {
        socket.on('connect', () => {
            console.log("Connected!");
        });
        socket.on('disconnect', () => {
            console.log("Disconnected!");
        });
        socket.on("connect_error", (err) => console.error(err.message));
        socket.on("singleChat", (poruka) => {
            console.log("Primljena poruka: " + poruka);
        })

        if (selectedChat) {
            socket.auth = user;
            socket.connect();
        }

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('connect_error');
            socket.off('singleChat');

            socket.disconnect();
        };
    }, [selectedChat, user]);

    const { control, handleSubmit, reset } = useForm<AddChatFormData>();
    const onSubmit = (data: AddChatFormData) => {
        reset();

        socket.emit('singleChat', {
            tekst: data.message,
            from: user,
        });
    };

    if (!selectedChat) return <></>;
    return (
        <Stack direction='column' height='100%'>
            <Paper sx={{ px: '2rem' }}>
                <ChatBarHeader selectedChat={selectedChat} closeChat={closeChat} />
            </Paper>
            <Box flex='1' sx={{ padding: '2rem' }}>
                Poruke
            </Box>
            <Paper sx={{ padding: '2rem' }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack direction='row'>
                        <ControlledOutlineTextfield control={control} name="message" variant="outlined" label='Message' multiline fullWidth />
                        <LoadingButton variant="contained" loading={false} type="submit"><ChatBubbleIcon /></LoadingButton>
                    </Stack>
                </form>
            </Paper>
        </Stack>
    );
};

export default ChatBar;