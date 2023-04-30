import { Container, Paper } from "@mui/material";
import { InferGetServerSidePropsType } from "next";

import ChatAppLayout from "../../layouts/ChatAppLayout";
import withSession from "../../lib/withSession";
import FriendsList from "../../features/FriendsList";
import FriendRequestsList from "../../features/FriendRequestsList";
import AddFriend from "../../features/AddFriend";

export const getServerSideProps = withSession(async ({ req }) => {
    const user = req.session.korisnik;
    if (!user) return { redirect: { destination: '/login', permanent: false } }
    return {
        props: {
            user,
        }
    };
});

const Friends: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ user }) => {
    return (
        <main>
            <ChatAppLayout user={user}>
                <Container sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '2rem', padding: '2rem' }}>
                    <Paper sx={{ padding: '2rem', width: '100%' }}>
                        <AddFriend />
                    </Paper>
                    <Paper sx={{ padding: '2rem', width: '100%' }}>
                        <FriendsList />
                    </Paper>
                    <Paper sx={{ padding: '2rem', width: '100%' }}>
                        <FriendRequestsList />
                    </Paper>
                </Container>
            </ChatAppLayout>
        </main>
    );
};

export default Friends;