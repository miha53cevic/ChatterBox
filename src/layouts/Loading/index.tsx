import { CircularProgress } from '@mui/material';
import { Stack } from '@mui/system';

/**
 * Empty page with centered loading circle
 */
const Loading: React.FC = () => {
    return (
        <Stack direction='row' justifyContent='center' alignItems='center' sx={{ minHeight: '100vh' }}>
            <CircularProgress />
        </Stack>
    );
};

export default Loading;