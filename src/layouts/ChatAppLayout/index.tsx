import * as React from "react";
import { Box, Stack } from "@mui/material";
import { korisnik } from "@prisma/client";
import { useIdleTimer } from "react-idle-timer";

import { themes } from "../../Theme";
import LeftAppBar from "../LeftAppBar";
import BottomAppBar from "../BottomAppBar";
import useDesktop from "../../hooks/useDesktop";
import useColorTheme from "../../hooks/useColorTheme";
import socket from "../../lib/SocketIOClient";
import { Fetcher } from "../../lib/Fetcher";
import { ApiChats } from "../../types/apiTypes";

export interface Props {
    children: React.ReactNode,
    user: korisnik,
    fullscreen?: boolean,
};

const ChatAppLayout: React.FC<Props> = ({ children, user, fullscreen }) => {

    // Ovi eventi se uvjek zovu, neovisno o pod komponenti unutar /app/...
    // odnosno svi podkomponenti unutar /app implementiraju ChatAppLayout pa se ovo uvjek zove unutar njih
    React.useEffect(() => {
        if (!user) throw new Error("ChatPage: user not defined!");

        const socketRegister = async () => {
            socket.on('connect', () => {
                console.log("SocketIO: Connected!");
            });
            socket.on('disconnect', () => {
                console.log("SocketIO: Disconnected!");
            });
            socket.on("connect_error", (err) => console.error(err.message));

            try {
                const data = await Fetcher<ApiChats>('/api/chats');
                socket.auth = {
                    user: user,
                    userChats: data,
                };
                socket.connect();
            } catch (err) {
                throw new Error("Could not fetch user chats!");
            }
        };
        socketRegister();

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('connect_error');

            socket.disconnect();
        };
    }, [user]);

    /////////////////////////////////////////////////////////////////////////

    // idleTimer for away status
    const handleIdle = () => {
        console.log("I'm afk")
        socket.emit('away');
    };
    const handleActiveAgain = () => {
        console.log("I'm back baby");
        socket.emit('active');
    };
    const idleTimer = useIdleTimer({
        onIdle: handleIdle,
        onActive: handleActiveAgain,
        timeout: 1 * 60 * 1000, // 1 minute(s) to go afk
    });

    /////////////////////////////////////////////////////////////////////////

    // Set users colour theme
    const { setTheme } = useColorTheme();
    React.useEffect(() => {
        setTheme(Object.values(themes)[user.izgledapp]);
        console.log(user);
    }, [setTheme, user]);

    const desktop = useDesktop();
    if (desktop && fullscreen) {
        return (
            <main>
                <Stack direction='row' sx={{ maxHeight: '100vh' }}>
                    <Box flexGrow={0}>
                        <LeftAppBar />
                    </Box>
                    <Box flexGrow={1}>
                        {children}
                    </Box>
                </Stack>
            </main>
        );
    }
    else if (desktop) {
        return (
            <main>
                <Stack direction='row' sx={{ minHeight: '100vh' }}>
                    <Box flexGrow={0}>
                        <LeftAppBar />
                    </Box>
                    <Box flexGrow={1}>
                        {children}
                    </Box>
                </Stack>
            </main>
        );
    }
    else return (
        <main>
            <Stack direction='column' sx={{ maxHeight: '100vh', height: '100vh' }}>
                <Stack direction='column' flexGrow={1} sx={{ overflowY: 'auto' }}>
                    {children}
                </Stack>
                <Box flexGrow={0}>
                    <BottomAppBar />
                </Box>
            </Stack>
        </main>
    );
};

export default ChatAppLayout;