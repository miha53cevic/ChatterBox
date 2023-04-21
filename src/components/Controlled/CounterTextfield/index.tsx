import { useState } from 'react';
import { TextField, StandardTextFieldProps, Typography, Box } from '@mui/material';
import { Control, Controller } from 'react-hook-form';

export interface Props extends StandardTextFieldProps {
    maxLength: number,
    control: Control<any, any>,
    name: string,
    defaultVal: string,
};


/**
 * MUI Textfield with word limit and counter
 * @param maxLength max number of words
 * @param control react-hook-form control
 * @param name name that will be used when submiting form to react-hook-form
 * @param defaultVal the default value of the input, can be used to preload
 * @param StandardTextFieldProps MUI TextareaAutosize props are extended in Props and available to use 
 */
const CounterStandardTextfield: React.FC<Props> = ({ control, name, defaultVal, ...props }) => {

    const [counter, setCounter] = useState<number>(0);
    const maxCount = props.maxLength;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setCounter(e.target.value.length);
    };

    return (
        <Controller
            control={control}
            name={name}
            defaultValue={defaultVal}
            render={({ field: { ref, onChange, ...field } }) => (
                <Box sx={{ position: 'relative' }}>
                    <TextField
                        variant='standard'
                        {...props}
                        onChange={e => {
                            // Call both on change functions otherwise react-form-hooks can't update value
                            if (onChange) onChange(e);
                            handleChange(e);
                        }}
                        inputProps={{ maxLength: props.maxLength }}
                        inputRef={ref}
                        {...field}
                    />
                    <Box sx={{ position: 'absolute', right: 0 }}>
                        <Typography>{`${counter} / ${maxCount}`}</Typography>
                    </Box>
                </Box>
            )}
        />
    );
};

export default CounterStandardTextfield;