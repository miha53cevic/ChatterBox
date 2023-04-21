import React from 'react';
import { Slide, Dialog, AppBar, Container, IconButton, Paper, Toolbar, Typography, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TransitionProps } from '@mui/material/transitions';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export interface ButtonOptions {
    text?: string,
    forForm?: string,
    hidden?: boolean,
};

export interface Props {
    open: boolean,
    handleClose: () => void,
    children?: React.ReactNode,
    title?: string,
    buttonOptions?: ButtonOptions,
};

/**
 * @param open state value
 * @param handleClose () => setOpen(!open)
 * @param children OPTIONAL content
 * @param title OPTIONAL header title
 * @param buttonOptions OPTIONAL { text, forForm, hidden }
 */
const DialogFullscreen: React.FC<Props> = ({ open, handleClose, children, title, buttonOptions }) => {

    return (
        <Dialog
            fullScreen
            open={open}
            onClose={handleClose}
            TransitionComponent={Transition}
        >
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleClose}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        {title}
                    </Typography>
                    <Button autoFocus color="inherit" onClick={handleClose} type='submit' form={buttonOptions?.forForm} sx={{ display: (buttonOptions?.hidden) ? 'none' : 'initial' }}>
                        {buttonOptions?.text}
                    </Button>
                </Toolbar>
            </AppBar>
            <Container sx={{ my: 4 }}>
                <Paper sx={{ p: 4 }}>
                    {children}
                </Paper>
            </Container>
        </Dialog>
    );
}

export default DialogFullscreen;