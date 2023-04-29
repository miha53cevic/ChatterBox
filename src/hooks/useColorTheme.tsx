import React, { useContext } from 'react';
import ColorThemeContext from '../contexts/ColorThemeContext';

const useColorTheme = () => useContext(ColorThemeContext);

export default useColorTheme;
