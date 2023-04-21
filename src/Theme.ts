import { Roboto } from '@next/font/google';
import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

export const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
    fallback: ['Helvetica', 'Arial', 'sans-serif'],
});

const PurpleDarkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#785ba3',
        },
        secondary: {
            main: '#dbd8e3',
        },
        error: {
            main: red.A400,
        },
    },
    typography: {
        fontFamily: roboto.style.fontFamily,
    },
});

const DefaultTheme = createTheme({
    palette: {
        primary: {
            main: '#556cd6',
        },
        secondary: {
            main: '#19857b',
        },
        error: {
            main: red.A400,
        },
    },
    typography: {
        fontFamily: roboto.style.fontFamily,
    },
});

export default PurpleDarkTheme;
