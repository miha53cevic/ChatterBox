import { Theme } from "@mui/material";
import { createContext } from "react";
import DefaultTheme from "../Theme";

type getThemeFunction = () => Theme;
type setThemeFunction = (theme: Theme) => void;

export interface ColorThemeContextProps {
    getTheme: getThemeFunction,
    setTheme: setThemeFunction,
};

const defaultVal: ColorThemeContextProps = {
    getTheme: () => DefaultTheme,
    setTheme: (theme) => {},
};

const ColorThemeContext = createContext<ColorThemeContextProps>(defaultVal);

export default ColorThemeContext;
