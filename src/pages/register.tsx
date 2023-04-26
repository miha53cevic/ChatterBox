import { useState } from "react";
import { Stack, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import useSWRMutation from 'swr/mutation';

import LoginRegisterTemplate from '../features/LoginRegisterTemplate';
import { ControlledOutlineTextfield } from "../components/Controlled/ControlledTextfield";
import { ControlledPasswordTextField } from "../components/Controlled/ControlledPasswordTextField";
import LoadingButton from "../components/LoadingButton";
import useErrorAlert from "../hooks/useErrorAlert";
import { Poster } from "../lib/Fetcher";

export interface RegisterForm {
    username: string,
    email: string,
    password: string,
    repeatPassword: string,
};

interface RegisterData {
    username: string,
    email: string,
    password: string,
};

const Register = () => {

    const { trigger } = useSWRMutation('/api/register', Poster<RegisterData, any>);

    const { control, handleSubmit, reset } = useForm<RegisterForm>();

    const onSubmit = async (data: RegisterForm) => {
        if (data.repeatPassword !== data.password) {
            showError("Passwords do not match!");
            reset();
            return;
        }

        setLoading(true);
        // Call /api/register
        const sendData: RegisterData = {
            username: data.username,
            email: data.email,
            password: data.password,
        };
        try {
            await trigger(sendData);
        } catch(error: any) {
            console.error(error.response);
            if (error.response.status == 409) showError("Username or email already taken!");
            else showError(`${JSON.stringify(error.response)}`);

            // Reset Username and email fields
            reset(values => {
                values.username = "";
                values.email = "";
                return values;
            });
        }
        setLoading(false);
    };

    const [loading, setLoading] = useState(false);
    const showError = useErrorAlert();

    const passwordPattern = "^.{8,}";
    return (
        <LoginRegisterTemplate type='register'>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack direction='column' spacing='1rem'>
                    <ControlledOutlineTextfield control={control} name='username' variant='outlined' label="Username" required />
                    <ControlledOutlineTextfield control={control} name='email' variant='outlined' label="E-mail" required />
                    <ControlledPasswordTextField control={control} name='password' label="Password" required pattern={passwordPattern} />
                    <ControlledPasswordTextField control={control} name='repeatPassword' label="Repeat Password" required pattern={passwordPattern} />
                    <LoadingButton variant='contained' size='large' type='submit' loading={loading}>Register</LoadingButton>
                </Stack>
                <Typography variant='caption'>* Password must be at least 8 charachters long</Typography>
            </form>
        </LoginRegisterTemplate>
    );
};

export default Register;