import Link from 'next/link';

export { Link as NextLink };

export interface UnstyledNextLinkProps {
    href: string,
    children: React.ReactNode,
};

export const UnstyledNextLink: React.FC<UnstyledNextLinkProps> = ({ href, children }) => {
    return (
        <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
            {children}
        </Link>
    );
};
