import { ChangeEventHandler, useState } from "react";
import { Avatar, Grid, Paper, Stack, Button, Typography, Container, Box } from "@mui/material";
import { InferGetServerSidePropsType } from "next";
import { useForm } from "react-hook-form";

import ChatAppLayout from "../../layouts/ChatAppLayout";
import ChooseThemeColors, { CurrentThemeColorIcon } from "../../features/ChooseThemeColors";
import withSession from "../../lib/withSession";
import DialogCustomForm from "../../components/Dialogs/CustomForm";
import { ControlledPasswordTextField } from "../../components/Controlled/ControlledPasswordTextField";
import { S3Upload } from "../../lib/S3Bucket";
import useErrorAlert from "../../hooks/useErrorAlert";

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
    const onSubmit = (data: { password: string }) => {
        console.log("New password is: " + data.password);
        reset();
    };

    const handleChangeImage: ChangeEventHandler<HTMLInputElement> = async (e) => {
        if (!e.target.files) return;

        const file = e.target.files[0];
        const ext = e.target.files[0].type.split('/')[1];

        try {
            const response = await S3Upload(`avatar_${user.idkorisnik}.${ext}`, true, file);
            console.log(response);

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
                text="Enter a new password"
                open={openChangePass}
                handleClose={() => setOpenChangePass(false)}
                submitText="Change password"
                submitForForm="changePasswordForm"
            >
                <form id='changePasswordForm' onSubmit={(handleSubmit(onSubmit))}>
                    <ControlledPasswordTextField control={control} name='password' label="Password" pattern="^.{8,}" />
                </form>
            </DialogCustomForm>
            <ChatAppLayout user={user}>
                <Container sx={{ minHeight: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Paper sx={{ padding: '2rem', width: '100%' }}>
                        <Grid container spacing='4rem'>
                            <Grid item xs={12} md={6}>
                                <Stack direction='column' alignItems='center' spacing='1rem'>
                                    <Avatar sx={{ width: '96px', height: '96px' }} />
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
                                        <Typography variant='h4'>Username</Typography>
                                        <Typography>Email</Typography>
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