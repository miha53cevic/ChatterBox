import { Avatar, Stack, Typography } from '@mui/material';
import { InferGetServerSidePropsType } from 'next';
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

const App: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ user }) => {
    return (
        <main>
            <ChatAppLayout user={user}>
                <Stack direction='column' justifyContent='center' alignItems='center' height='100%' spacing='1rem'>
                    <Avatar sx={{ width: '128px', height: '128px' }} src={user.avatarurl} />
                    <Typography variant='h3'>Hello, {user.korisnickoime}</Typography>
                </Stack>
            </ChatAppLayout>
        </main>
    );
};

export default App;