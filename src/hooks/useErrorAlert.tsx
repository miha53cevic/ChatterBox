import React, { useContext } from 'react';
import ErrorAlertContext from '../contexts/ErrorAlertContext';

const useErrorAlert = () => useContext(ErrorAlertContext);

export default useErrorAlert;
