import { Paper, Stack, Box } from "@mui/material";
import { InferGetServerSidePropsType } from "next";

import ChatList from "../../features/ChatList";
import ChatAppLayout from "../../layouts/ChatAppLayout";
import withSession from "../../lib/withSession";

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

    return (
        <main>
            <ChatAppLayout>
                <Stack direction='row' height='100%'>
                    <Box sx={{ overflowY: 'scroll' }}>
                        <Paper sx={{ padding: '2rem', minHeight: '100%' }}>
                            <ChatList user={user} />
                        </Paper>
                    </Box>
                    <Box flex='1'>

                    </Box>
                </Stack>
            </ChatAppLayout>
        </main>
    );    
};

export default Chat;