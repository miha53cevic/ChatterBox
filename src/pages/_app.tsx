import * as React from 'react';
import Head from 'next/head';
import { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import Theme from '../Theme';
import createEmotionCache from '../createEmotionCache';

import DialogOkAlert from '../components/Dialogs/OkAlert';
import ErrorAlertContext from '../contexts/ErrorAlertContext';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
    emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
    const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

    const [openErrorDialog, setOpenErrorDialog] = React.useState(false);
    const [errorText, setErrorText] = React.useState("");
    const showError = (text: string) => {
        setOpenErrorDialog(true);
        setErrorText(text);
    };

    return (
        <CacheProvider value={emotionCache}>
            <Head>
                <meta name="viewport" content="initial-scale=1, width=device-width" />
            </Head>
            <ThemeProvider theme={Theme}>
                <ErrorAlertContext.Provider value={showError}>
                    <DialogOkAlert open={openErrorDialog} handleClose={() => setOpenErrorDialog(false)} title={"Error"} text={errorText} />
                    {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                    <CssBaseline />
                    <Component {...pageProps} />
                </ErrorAlertContext.Provider>
            </ThemeProvider>
        </CacheProvider>
    );
};
