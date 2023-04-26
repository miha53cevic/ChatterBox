import { createContext } from "react";

type showErrorFunction = (text: string) => void;

const ErrorAlertContext = createContext<showErrorFunction>(() => console.log("Context default value Error!"));

export default ErrorAlertContext;
