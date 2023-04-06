import React from 'react';
import { StandardTextFieldProps, TextField, OutlinedTextFieldProps } from '@mui/material';
import { Control, Controller } from 'react-hook-form';

/**
 * MUI Textfield to be used with react-hook-form
 * @param control react-hook-form control
 * @param name name that will be used when submiting form to react-hook-form
 * @param defaultVal the default value of the input, can be used to preload
 * @param StandardTextFeildProps MUI TextareaAutosize props are extended in Props and available to use 
 * @returns name paramater with the value of the input to react-hook-form
 * @example
 * const { control, handleSubmit } = useForm<formDataType>();
 * return <ControlledTextfield control={control} name='MyField' defaultVal={''} />
 */
export interface StandardProps extends StandardTextFieldProps {
    control: Control<any, any>,
    name: string,
    defaultVal: string,
};

export const ControlledStandardTextfield: React.FC<StandardProps> = ({ control, name, defaultVal, ...props }) => {

    return (
        <Controller
            control={control}
            name={name}
            defaultValue={defaultVal}
            render={({ field: { ref, ...field } }) => (
                <TextField
                    variant='standard'
                    {...props}
                    inputRef={ref}
                    {...field}
                />
            )}
        />
    );
};

export interface OutlineProps extends OutlinedTextFieldProps {
    control: Control<any, any>,
    name: string,
    defaultVal: string,
};

export const ControlledOutlineTextfield: React.FC<OutlineProps> = ({ control, name, defaultVal, ...props }) => {
    
    return (
        <Controller
            control={control}
            name={name}
            defaultValue={defaultVal}
            render={({ field: { ref, ...field } }) => (
                <TextField
                    {...props}
                    inputRef={ref}
                    {...field}
                />
            )}
        />
    );
};
