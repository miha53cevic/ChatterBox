import { useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import { Control, Controller } from 'react-hook-form';

export interface ControlledPasswordTextFieldProps {
    label: string,
    control: Control<any, any>,
    name: string,
    defaultVal?: string,
    pattern?: string,
    variant?: "outlined" | "standard" | "filled",
    fullWidth?: boolean,
    required?: boolean,
};

export const ControlledPasswordTextField: React.FC<ControlledPasswordTextFieldProps> = ({ label, control, name, defaultVal, pattern, variant, fullWidth, required }) => {

    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Controller
            control={control}
            name={name}
            defaultValue={defaultVal || ''}
            render={({ field }) => (
                <FormControl variant={variant || 'outlined'} fullWidth={fullWidth}>
                    <InputLabel>{required ? `${label} *` : label}</InputLabel>
                    <OutlinedInput label={required ? `${label} *` : label} type={showPassword ? 'text' : 'password'}
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
                        inputProps={{ pattern: pattern }}
                    />
                </FormControl>
            )}
        />
    );
};
