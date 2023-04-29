import { Box, IconButton, Stack } from "@mui/material";
import useSWRMutation from 'swr/mutation';

import DialogFullscreen from "../../components/Dialogs/Fullscreen";
import useColorTheme from "../../hooks/useColorTheme";
import { themes } from '../../Theme';
import { Poster } from "../../lib/Fetcher";
import useErrorAlert from "../../hooks/useErrorAlert";

export interface ThemeColorIconProps {
    primaryColor: string,
    secondaryColor: string,
};

export const ThemeColorIcon: React.FC<ThemeColorIconProps> = ({ primaryColor, secondaryColor }) => {
    return (
        <Box sx={{
            width: '96px',
            height: '96px',
            border: 'solid black',
            borderRadius: '50%',
            background: `linear-gradient( -45deg, ${primaryColor} 50%, ${secondaryColor} 50% )`,
        }}></Box>
    );
};

export const CurrentThemeColorIcon: React.FC = () => {
    const { getTheme } = useColorTheme();
    const currentTheme = getTheme();
    return (
        <ThemeColorIcon primaryColor={currentTheme.palette.primary.main} secondaryColor={currentTheme.palette.secondary.main} />
    );
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface Props {
    open: boolean,
    handleClose: () => void,
};

const ChooseThemeColors: React.FC<Props> = ({ open, handleClose }) => {

    const { getTheme, setTheme } = useColorTheme();
    const showError = useErrorAlert();

    const { trigger } = useSWRMutation('/api/theme', Poster<{ themeIndex: number }, any>);
    const close = async () => {
        // Update with new user ColorTheme
        try {
            const themeIndex = Object.values(themes).indexOf(getTheme());
            await trigger({ themeIndex: themeIndex });
        } catch(error) {
            showError(JSON.stringify(error));
            console.error(error);
        }

        handleClose();
    };

    return (
        <DialogFullscreen
            title="Choose color theme"
            open={open}
            handleClose={close}
            buttonOptions={{
                hidden: true,
            }}
        >
            <Stack direction='row' flexWrap='wrap' spacing='1rem'>
                {Object.values(themes).map((item, index) => (
                    <IconButton key={index} onClick={() => setTheme(item)}>
                        <ThemeColorIcon primaryColor={item.palette.primary.main} secondaryColor={item.palette.secondary.main} />
                    </IconButton>
                ))}
            </Stack>
        </DialogFullscreen>
    );
};

export default ChooseThemeColors;