import { useMediaQuery } from '@mui/material';

const useDesktop = () => {
    const result = useMediaQuery('(min-width:600px)');
    return result;
};

export default useDesktop;