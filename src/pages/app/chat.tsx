import * as React from 'react';
import { Paper, Stack, Box } from "@mui/material";
import { InferGetServerSidePropsType } from "next";

import withSession from "../../lib/withSession";
import ChatAppLayout from "../../layouts/ChatAppLayout";
import ChatList from "../../features/ChatList";
import ChatBar from "../../features/ChatBar";
import socket from '../../lib/SocketIOClient';

import { Chat } from '../../types/apiTypes';

export const getServerSideProps = withSession(async ({ req }) => {
    const user = req.session.korisnik;
    if (!user) return { redirect: { destination: '/login', permanent: false } }
    return {
        props: {
            user,
        }
    };
});

const Chat: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ user }) => {

    // Ovi eventi se uvjek zovu, neovisno o pod komponenti unutar chat
    React.useEffect(() => {
        socket.on('connect', () => {
            console.log("SocketIO: Connected!");
        });
        socket.on('disconnect', () => {
            console.log("SocketIO: Disconnected!");
        });
        socket.on("connect_error", (err) => console.error(err.message));

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('connect_error');
        };
    }, []);

    const [selectedChat, setSelectedChat] = React.useState<Chat | null>(null);
    return (
        <main>
            <ChatAppLayout user={user} fullscreen>
                <Stack direction='row' height='100%'>
                    <Box sx={{ overflowY: 'scroll' }}>
                        <Paper sx={{ padding: '2rem', minHeight: '100%' }}>
                            <ChatList user={user} selectChat={setSelectedChat} />
                        </Paper>
                    </Box>
                    <Box flex='1'>
                        {selectedChat ?
                            <ChatBar user={user} selectedChat={selectedChat} closeChat={() => setSelectedChat(null)} />
                            : null
                        }
                    </Box>
                </Stack>
            </ChatAppLayout>
        </main>
    );    
};

export default Chat;