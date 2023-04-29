import { useEffect } from "react";
import { Box, Stack } from "@mui/material";
import { korisnik } from "@prisma/client";

import { themes } from "../../Theme";
import LeftAppBar from "../LeftAppBar";
import useDesktop from "../../hooks/useDesktop";
import BottomAppBar from "../BottomAppBar";
import useColorTheme from "../../hooks/useColorTheme";

export interface Props {
    children: React.ReactNode,
    user: korisnik,
};

const ChatAppLayout: React.FC<Props> = ({ children, user }) => {

    // Set users colour theme
    const { setTheme } = useColorTheme();
    useEffect(() => {
        setTheme(Object.values(themes)[user.izgledapp]);
        console.log(user);
    }, [setTheme, user]);

    const desktop = useDesktop();
    if (desktop) {
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
    return (
        <main>
            <Stack direction='column' sx={{ minHeight: '100vh' }}>
                <Box flexGrow={1}>
                    {children}
                </Box>
                <Box flexGrow={0}>
                    <BottomAppBar />
                </Box>
            </Stack>
        </main>
    );
};

export default ChatAppLayout;