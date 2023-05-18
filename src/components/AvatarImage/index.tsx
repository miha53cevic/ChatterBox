/* eslint-disable @next/next/no-img-element */

export interface Props {
    url: string | null,
    width?: string,
    height?: string,
};

/**
 * @param url - url of the avatar image
 * @param width - OPTIONAL width of the image, default is 100px 
 * @param height - OPTIONAL height of the image, default is 100px 
 */
const AvatarImage: React.FC<Props> = ({ url, width, height }) => {

    return (
        <img src={url || 'https://picsum.photos/200'}
            width={width || '100px'}
            height={height || '100px'}
            loading="lazy" alt="avatar_image"
            style={{ borderRadius: '50%', border: 'solid black' }}
        />
    );
};

export default AvatarImage;