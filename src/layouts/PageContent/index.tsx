import { Container } from '@mui/material';

export interface Props {
    children: React.ReactNode,
    my?: string,
    centerX?: boolean,
    centerY?: boolean,
};

/**
 * Layout for most standard pages, has an appbar, content and footer.
 * Content is never clipped because of min-height: 100vh making it always scrollable on overflow and visible.
 * Content is also in MUI Container so it takes less width on bigger screens (has a max-width property of about 1200px)
 * @param children Content to render
 * @param my Top and bottom margins to make space between content and appbar/footer
 * @param centerX flex center on the horizontal axis content
 * @param centerY flex center on the vertical axis content
 */
const PageContent: React.FC<Props> = ({ children, my, centerX, centerY }) => {

    return (
        <Container sx={{
            minHeight: '100vh',
            paddingTop: my,
            paddingBottom: my,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: centerY ? 'center' : undefined,
            alignItems: centerX ? 'center' : undefined,
        }}>
            {children}
        </Container>
    );
};

export default PageContent;