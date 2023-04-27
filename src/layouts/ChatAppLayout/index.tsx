import { Box, Stack } from "@mui/material";
import LeftAppBar from "../LeftAppBar";
import useDesktop from "../../hooks/useDesktop";
import BottomAppBar from "../BottomAppBar";

export interface Props {
    children: React.ReactNode,
};

const ChatAppLayout: React.FC<Props> = ({ children }) => {
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