import * as React from 'react';

const useNotificationSound = () => {
    const [audio, setAudio] = React.useState<HTMLAudioElement | null>(null);

    React.useEffect(() => {
        const notificationAudio = new Audio('/notification.mp3');
        setAudio(notificationAudio);
    }, []);

    return {
        audio: audio,
    };
};

export default useNotificationSound;