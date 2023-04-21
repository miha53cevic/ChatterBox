import { useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import { Control, Controller } from 'react-hook-form';

export interface ControlledPasswordTextFieldProps {
    label: string,
    control: Control<any, any>,
    name: string,
    defaultVal: string,
    fullWidth?: boolean,
    required?: boolean,
};

export const ControlledPasswordTextField: React.FC<ControlledPasswordTextFieldProps> = ({ label, control, name, defaultVal, fullWidth, required }) => {

    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Controller
            control={control}
            name={name}
            defaultValue={defaultVal}
            render={({ field }) => (
                <FormControl variant='outlined' fullWidth={fullWidth}>
                    <InputLabel>{`${label} *`}</InputLabel>
                    <OutlinedInput label={label} type={showPassword ? 'text' : 'password'}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={handleClickShowPassword}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        }
                        {...field}
                        required={required}
                    />
                </FormControl>
            )}
        />
    );
};
