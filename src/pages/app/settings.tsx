import { ChangeEventHandler, useState } from "react";
import { Avatar, Grid, Paper, Stack, Button, Typography, Container, Box } from "@mui/material";
import { InferGetServerSidePropsType } from "next";
import { useForm } from "react-hook-form";
import Router from "next/router";

import ChatAppLayout from "../../layouts/ChatAppLayout";
import ChooseThemeColors, { CurrentThemeColorIcon } from "../../features/ChooseThemeColors";
import withSession from "../../lib/withSession";
import DialogCustomForm from "../../components/Dialogs/CustomForm";
import { ControlledPasswordTextField } from "../../components/Controlled/ControlledPasswordTextField";
import { S3Upload } from "../../lib/S3Bucket";
import useErrorAlert from "../../hooks/useErrorAlert";
import { Poster } from "../../lib/Fetcher";

export const getServerSideProps = withSession(async ({ req }) => {
    const user = req.session.korisnik;
    if (!user) return { redirect: { destination: '/login', permanent: false } }
    return {
        props: {
            user,
        }
    };
});

const Settings: React.FC<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ user }) => {

    const showError = useErrorAlert();

    const [openChooseThemeColor, setOpenChooseThemeColor] = useState(false);
    const [openChangePass, setOpenChangePass] = useState(false);

    const { control, handleSubmit, reset } = useForm<{ password: string }>();
    const onSubmit = async (data: { password: string }) => {
        reset();

        try {
            await Poster('/api/change_password', { arg: { newPassword: data.password } });
            console.log("New password is: " + data.password);
        } catch(err) {
            showError("Error when changing password!");
        }
    };

    const handleChangeImage: ChangeEventHandler<HTMLInputElement> = async (e) => {
        if (!e.target.files) return;

        const file = e.target.files[0];
        const ext = e.target.files[0].type.split('/')[1];

        try {
            const response = await S3Upload(`avatar_${user.idkorisnik}.${ext}`, file);
            const res = await Poster('/api/change_avatar', { arg: { newAvatarUrl: `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}/avatar_${user.idkorisnik}.${ext}` } });
            Router.reload();
        } catch(err) {
            showError(`There was an error with uploading new avatar`);
            console.error(err);
        }
    };

    return (
        <main>
            <ChooseThemeColors open={openChooseThemeColor} handleClose={() => setOpenChooseThemeColor(false)} />
            <DialogCustomForm
                title="Change password"
                text="Password must be at least 8 characters long"
                open={openChangePass}
                handleClose={() => setOpenChangePass(false)}
                submitText="Change password"
                submitForForm="changePasswordForm"
            >
                <form id='changePasswordForm' onSubmit={(handleSubmit(onSubmit))}>
                    <ControlledPasswordTextField control={control} name='password' label="Password" pattern="^.{8,}" fullWidth />
                </form>
            </DialogCustomForm>
            <ChatAppLayout user={user}>
                <Container sx={{ minHeight: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Paper sx={{ padding: '2rem', width: '100%' }}>
                        <Grid container spacing='4rem'>
                            <Grid item xs={12} md={6}>
                                <Stack direction='column' alignItems='center' spacing='1rem'>
                                    <Avatar sx={{ width: '96px', height: '96px' }} src={user.avatarurl} />
                                    <Button variant='contained' component='label'>
                                        Change avatar
                                        <input
                                            type='file'
                                            accept="image/*"
                                            onChange={handleChangeImage}
                                            hidden
                                        />
                                    </Button>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Stack direction='column' justifyContent='center' alignItems='center' height='100%'>
                                    <Box>
                                        <Typography variant='h4'>{user.korisnickoime}</Typography>
                                        <Typography>{user.email}</Typography>
                                        <br/>
                                        <Button variant='contained' onClick={() => setOpenChangePass(true)}>Change password</Button>
                                    </Box>
                                </Stack>
                            </Grid>
                            <Grid item xs={12}>
                                <Stack direction='column' alignItems='center' spacing='1rem'>
                                    <CurrentThemeColorIcon />
                                    <Button variant="contained" onClick={() => setOpenChooseThemeColor(true)}>Change theme</Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
            </ChatAppLayout>
        </main>
    );
};

export default Settings;