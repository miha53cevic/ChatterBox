import { CircularProgress, Button, ButtonProps, Stack } from '@mui/material';

export interface Props extends ButtonProps {
    loading: boolean,
};

const LoadingButton: React.FC<Props> = ({ loading, children, ...props }) => {
    if (!loading) return <Button {...props}>{children}</Button>;
    else return (
        <Stack direction='row' justifyContent='center'>
            <CircularProgress />
        </Stack>
    );
};

export default LoadingButton;
