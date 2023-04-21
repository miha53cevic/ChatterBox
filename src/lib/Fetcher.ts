import axios from 'axios';

export async function Poster<T = any, V = any>(url: string, { arg }: { arg: T }) {
    return (await axios.post(url, arg)).data as V;
};

export async function Fetcher<T = any>(url: string) {
    return (await axios.get(url)).data as T;
};
