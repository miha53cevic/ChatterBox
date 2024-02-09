import * as React from 'react';
import { Paper, Stack, Box } from "@mui/material";
import { InferGetServerSidePropsType } from "next";

import withSession from "../../lib/withSession";
import ChatAppLayout from "../../layouts/ChatAppLayout";
import ChatList from "../../features/ChatList";
import ChatBar from "../../features/ChatBar";
import socket from '../../lib/SocketIOClient';
import useNotificationSound from '../../hooks/useNotificationSound';
import useDesktop from '../../hooks/useDesktop';

import { Chat } from '../../types/apiTypes';
import { IConnectedUser, IMessage, INotification } from '../../types';
import { Fetcher } from '../../lib/Fetcher';

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
    const [notifications, setNotifications] = React.useState<INotification[]>([]);
    const [selectedChat, setSelectedChat] = React.useState<Chat | null>(null);

    const { audio } = useNotificationSound();

    // Get connectedUsers for status display & play sound on receiving message
    React.useEffect(() => {
        socket.on('connectedUsers', (connectedUsers: IConnectedUser[]) => {
            setConnectedUsers([...connectedUsers]);
        });
    
        // Initial notifications from db on first connect then client takes over counting
        const getInitialNotifications = async () => {
            try {
                const data = await Fetcher<INotification[]>('/api/notifications');
                if (notifications.length === data.length) return;
                setNotifications(data);
                console.log("[chat]: Got notifications " + data.length);
            } catch(err) {
                console.error("[chat]: Could not load inital notifications");
            }
        };
        getInitialNotifications();

        const notificationOnMessage = (msg: IMessage) => {
            if (!audio) return;
            // Ako nismo u chatu s tim korisnikom pusti notificationSound
            if (selectedChat === null || selectedChat.idrazgovor !== msg.idChat) {
                audio.play().catch(err => {
                    console.error(err);
                });

                // Dodaj notification +1 za taj chat
                const copy = [...notifications];
                // check if notification exists already or just add to it
                const existingNotification = copy.find(n => n.idChat === msg.idChat);
                if (!existingNotification) {
                    copy.push({ idChat: msg.idChat, unreadCount: 1 });
                } else existingNotification.unreadCount++;
                setNotifications(copy);
            }
        };
        socket.on('message', notificationOnMessage);

        return () => {
            socket.off('connectedUsers');
            socket.off('notifications');
            socket.off('message', notificationOnMessage);
        };
    }, [user, selectedChat, audio, notifications]);

    // ako nije useCallback funkcija se rekreira svaki put dok se salje ChatList di je onda infinite loop
    const readAllInChat = React.useCallback((idChat: number) => {
        setNotifications(old => old.filter(n => n.idChat !== idChat));
    }, [setNotifications]);

    const desktop = useDesktop();
    if (desktop) return (
        <main>
            <ChatAppLayout user={user} fullscreen>
                <Stack direction='row' height='100%'>
                    <Box sx={{ overflowY: 'scroll' }}>
                        <Paper sx={{ padding: '2rem', minHeight: '100%' }}>
                            <ChatList user={user} selectChat={setSelectedChat} connectedUsers={connectedUsers} notifications={notifications} />
                        </Paper>
                    </Box>
                    <Box flex='1'>
                        {selectedChat ?
                            <ChatBar user={user} selectedChat={selectedChat} closeChat={() => setSelectedChat(null)} connectedUsers={connectedUsers} readAllInChat={readAllInChat} />
                            : null
                        }
                    </Box>
                </Stack>
            </ChatAppLayout>
        </main>
    );
    else return (
        <main>
            <ChatAppLayout user={user}>
                <Stack direction='row' height='100%'>
                    {!selectedChat ?
                        <Box sx={{ overflowY: 'scroll' }} flex='1'>
                            <Paper sx={{ padding: '1rem', minHeight: '100%' }}>
                                <ChatList user={user} selectChat={setSelectedChat} connectedUsers={connectedUsers} notifications={notifications} />
                            </Paper>
                        </Box>
                        :
                        <Box flex='1'>
                            <ChatBar user={user} selectedChat={selectedChat} closeChat={() => setSelectedChat(null)} connectedUsers={connectedUsers} readAllInChat={readAllInChat} />
                        </Box>
                    }
                </Stack>
            </ChatAppLayout>
        </main>
    );
};

export default Chat;