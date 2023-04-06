import * as React from 'react';
import { Button, Paper, Stack, Typography } from '@mui/material';
import { ControlledOutlineTextfield } from '../components/ControlledTextfield';
import { useForm } from 'react-hook-form';
import useSWRMutation from 'swr/mutation';
import axios from 'axios';
import { useRouter } from 'next/router';

export interface IRegisterForm {
    email: string,
    name: string,
    password: string,
};

async function poster(url: string, { arg }: { arg: IRegisterForm | ILoginForm }) {
    return await axios.post(url, arg);
};

export const RegisterForm: React.FC = () => {

    const { control, handleSubmit, reset } = useForm<IRegisterForm>();
    const { trigger, isMutating } = useSWRMutation('/api/register', poster);

    const onSubmit = async (data: IRegisterForm) => {
        try {
            await trigger(data);
            reset();
        } catch(err) {
            // ...handle error
        }
    };

    return (
        <Paper sx={{ padding: '2rem' }}>
            <Stack direction='row' justifyContent='center'>
                <Typography variant='h4'>Register</Typography>
            </Stack>
            <br/>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack direction='column' alignItems='center' spacing='1rem'>
                    <ControlledOutlineTextfield name='email' control={control} defaultVal='' variant={'outlined'} label='E-Mail' required />
                    <ControlledOutlineTextfield name='name' control={control} defaultVal='' variant={'outlined'} label='Name' required />
                    <ControlledOutlineTextfield name='password' type='password' control={control} defaultVal='' variant={'outlined'} label='Password' required />
                    <Button variant='contained' type='submit' disabled={isMutating}>Register</Button>
                </Stack>
            </form>
        </Paper>
    );
};

export interface ILoginForm {
    email: string,
    password: string,
};

export const LoginForm: React.FC = () => {

    const { control, handleSubmit, reset } = useForm<IRegisterForm>();
    const { trigger, isMutating } = useSWRMutation('/api/login', poster);

    const router = useRouter();

    const onSubmit = async (data: ILoginForm) => {
        try {
            await trigger(data);
            reset();
            router.push('/profile');
        } catch(err) {
            // ...handle error
        }
    };

    return (
        <Paper sx={{ padding: '2rem' }}>
            <Stack direction='row' justifyContent='center'>
                <Typography variant='h4'>Login</Typography>
            </Stack>
            <br/>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack direction='column' alignItems='center' spacing='1rem'>
                    <ControlledOutlineTextfield name='email' control={control} defaultVal='' variant={'outlined'} label='E-Mail' required />
                    <ControlledOutlineTextfield name='password' type='password' control={control} defaultVal='' variant={'outlined'} label='Password' required />
                    <Button variant='contained' type='submit' disabled={isMutating}>Login</Button>
                </Stack>
            </form>
        </Paper>
    );
};
