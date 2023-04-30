import { Container, Paper } from "@mui/material";
import { InferGetServerSidePropsType } from "next";

import ChatAppLayout from "../../layouts/ChatAppLayout";
import withSession from "../../lib/withSession";
import FriendsList from "../../features/FriendsList";

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
                <Container sx={{ minHeight: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Paper sx={{ padding: '2rem', width: '100%' }}>
                        <FriendsList user={user} />
                    </Paper>
                </Container>
            </ChatAppLayout>
        </main>
    );
};

export default Friends;