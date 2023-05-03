import { Roboto } from "next/font/google";
import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { red } from '@mui/material/colors';

export const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
    fallback: ['Helvetica', 'Arial', 'sans-serif'],
});

const BluishDarkTheme = responsiveFontSizes(createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#e4f1fe',
        },
        secondary: {
            main: '#8dc6ff',
        },
        error: {
            main: red.A400,
        },
    },
    typography: {
        fontFamily: roboto.style.fontFamily,
    },
}));

const PurpleDarkTheme = responsiveFontSizes(createTheme({
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
}));

const DefaultTheme = responsiveFontSizes(createTheme({
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
}));

export const themes = {
    DefaultTheme, PurpleDarkTheme, BluishDarkTheme
};

export default DefaultTheme;