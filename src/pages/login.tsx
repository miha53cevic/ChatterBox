import { useState } from 'react';
import { Stack } from "@mui/material";
import { useForm } from "react-hook-form";
import useSWRMutation from 'swr/mutation';

import LoginRegisterTemplate from '../features/LoginRegisterTemplate';
import { ControlledOutlineTextfield } from "../components/Controlled/ControlledTextfield";
import { ControlledPasswordTextField } from "../components/Controlled/ControlledPasswordTextField";
import LoadingButton from "../components/LoadingButton";
import useErrorAlert from "../hooks/useErrorAlert";
import { Poster } from "../lib/Fetcher";

export interface LoginForm
{
    usernameOrEmail: string,
    password: string,
};

const Login = () => {

    const { trigger } = useSWRMutation('/api/login', Poster<LoginForm, any>);

    const { control, handleSubmit, reset } = useForm<LoginForm>();

    const onSubmit = async (data: LoginForm) => {
        setLoading(true);
        // Call /api/login
        try {
            await trigger(data);
            // TODO - refresh state and goto /app
        } catch(error: any) {
            console.error(error.response);
            if (error.response.status == 401) showError("Username/Email or password incorrect");
            else showError(`${JSON.stringify(error.response)}`);

            // Reset password field on error
            reset(values => {
                values.password = "";
                return values;
            });
        }
        setLoading(false);
    };

    const [loading, setLoading] = useState(false);
    const showError = useErrorAlert();

    return (
        <LoginRegisterTemplate type='login'>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack direction='column' spacing='1rem'>
                    <ControlledOutlineTextfield control={control} name='usernameOrEmail' variant='outlined' label="UsernameOrEmail" required />
                    <ControlledPasswordTextField control={control} name='password' label="Password" required />
                    <LoadingButton variant='contained' size='large' type='submit' loading={loading}>Login</LoadingButton>
                </Stack>
            </form>
        </LoginRegisterTemplate>
    );
};

export default Login;