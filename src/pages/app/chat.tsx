import * as React from 'react';
import { Paper, Stack, Box } from "@mui/material";
import { InferGetServerSidePropsType } from "next";
import { korisnik } from '@prisma/client';

import withSession from "../../lib/withSession";
import ChatAppLayout from "../../layouts/ChatAppLayout";
import ChatList from "../../features/ChatList";
import ChatBar from "../../features/ChatBar";
import socket from '../../lib/SocketIOClient';

import { Chat } from '../../types/apiTypes';
import { IConnectedUser } from '../../types';

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

    const [connectedUsers, setConnectedUsers] = React.useState<IConnectedUser[]>([]);

    React.useEffect(() => {
        socket.on('connectedUsers', (connectedUsers: IConnectedUser[]) => {
            setConnectedUsers([...connectedUsers]);
        });

        return () => {
            socket.off('connectedUsers');
        };
    }, [user]);

    const [selectedChat, setSelectedChat] = React.useState<Chat | null>(null);
    return (
        <main>
            <ChatAppLayout user={user} fullscreen>
                <Stack direction='row' height='100%'>
                    <Box sx={{ overflowY: 'scroll' }}>
                        <Paper sx={{ padding: '2rem', minHeight: '100%' }}>
                            <ChatList user={user} selectChat={setSelectedChat} connectedUsers={connectedUsers} />
                        </Paper>
                    </Box>
                    <Box flex='1'>
                        {selectedChat ?
                            <ChatBar user={user} selectedChat={selectedChat} closeChat={() => setSelectedChat(null)} connectedUsers={connectedUsers} />
                            : null
                        }
                    </Box>
                </Stack>
            </ChatAppLayout>
        </main>
    );    
};

export default Chat;