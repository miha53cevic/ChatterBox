import React from 'react';
import { Dialog, DialogTitle, DialogContentText, DialogContent, DialogActions, Button } from "@mui/material";

export interface Props {
    title: string,
    text: string,
    open: boolean,
    handleClose: () => void,
    submitAction?: () => void,
    children?: React.ReactNode,
    submitText?: string,
    submitForForm?: string,
};

/**
 * @param title Dialog title
 * @param text Dialog text
 * @param open If the dialog is open or not
 * @param handleClose Function to change open prop to closed usually a state
 * @param submitAction OPTIONAL This function is called when the submit button is pressed
 * @param children OPTIONAL children elements to render in dialog, inputs for example
 * @param submitText OPTIONAL text for submit button
 * @param submitForForm OPTIONAL adds form={'submitForFormName'} attribute to submit button, can be used with react-hook-form
 */
const DialogCustomForm: React.FC<Props> = ({ children, title, text, open, submitAction, handleClose, submitText, submitForForm }) => {

    const handleSubmit = () => {
        if (submitAction) submitAction();
        handleClose();
    };

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
            <DialogContent>
                {children}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant='text'>
                    Cancel
                </Button>
                <Button onClick={handleSubmit} variant='contained' type='submit' form={submitForForm}>
                    {submitText || 'Submit'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default DialogCustomForm;