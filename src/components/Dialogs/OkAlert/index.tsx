import React from 'react';
import { Dialog, DialogTitle, DialogContentText, DialogContent, DialogActions, Button } from "@mui/material";

export interface Props {
    title: string,
    text: string,
    open: boolean,
    handleClose: () => void,
};

/**
 * Dialog that has an Ok button and displays some text
 * @param title Title of the dialog 
 * @param text Text of the dialog
 * @param open Is the dialog open or not
 * @param handleClose Function that changes open prop to false
 */
const DialogOkAlert: React.FC<Props> = ({ title, text, open, handleClose }) => {
    return (
        <Dialog
            open={open}
        >
            <DialogTitle>
                {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {text}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant='contained' autoFocus>
                    Ok
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default DialogOkAlert;