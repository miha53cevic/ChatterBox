/* eslint-disable @next/next/no-img-element */
import * as React from 'react';
import { Stack, Paper, Typography, Box, IconButton } from '@mui/material';
import EmojiIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import { korisnik, reakcijanaporuku } from '@prisma/client';

import AvatarImage from '../../components/AvatarImage';
import useColorTheme from '../../hooks/useColorTheme';
import useErrorAlert from '../../hooks/useErrorAlert';
import { Poster } from '../../lib/Fetcher';
import socket from '../../lib/SocketIOClient';

import { IMessage } from '../../types';

///////////////////////////////////////////////////////////////////////////////////////////////////////

interface AttachmentsProps {
    attachmenturls: string[],
    myAttachments: boolean,
};

const imageExt = ["jpeg", "jpg", "png"];

const Attachments: React.FC<AttachmentsProps> = ({ attachmenturls, myAttachments }) => {
    return (
        <React.Fragment>
            {attachmenturls.map((url, i) => {
                const fileName = url.split(`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}`)[1];
                const isImage = imageExt.includes(fileName.split('.')[1]);
                return (
                    <Paper key={i} sx={{ width: 'fit-content', ml: myAttachments ? 'auto' : 0 }}>
                        {isImage ?
                            <img src={url} style={{ maxWidth: '400px', maxHeight: '400px' }} alt='attachment_image' />
                            :
                            <a href={url}>
                                <Stack direction='column' alignItems='center' sx={{ p: '4rem' }}>
                                    <Typography>{fileName.split('/attachment_')[1]}</Typography>
                                    <DownloadIcon />
                                </Stack>
                            </a>
                        }
                    </Paper>
                );
            })}
        </React.Fragment>
    );
};

///////////////////////////////////////////////////////////////////////////////////////////////////////

interface MessageActionsProps {
    idPoruka: number,
    idChat: number,
}

const emojis = ["😀", "😂", "🙃", "😢", "😫"];

const MessageActions: React.FC<MessageActionsProps> = ({ idPoruka, idChat }) => {

    const showError = useErrorAlert();

    const [openEmojiList, setOpenEmojiList] = React.useState(false);
    const handleEmojiSelect = async (emoji: string) => {
        setOpenEmojiList(false);
        try {
            const reaction = await Poster('/api/reactions', { arg: { emoji: emoji, idPoruka: idPoruka } });
            // Notify other users about the reaction
            socket.emit('reaction', { idChat: idChat, ...reaction });
        } catch (err) {
            showError('Could not add reaction!');
        }
    };

    return (
        <Box>
            {openEmojiList ?
                <Box sx={{ backgroundColor: 'white', borderRadius: '1rem' }}>
                    {emojis.map((e, i) => (
                        <IconButton key={i} onClick={() => handleEmojiSelect(e)}>{e}</IconButton>
                    ))}
                </Box>
                : null
            }
            <IconButton onClick={() => setOpenEmojiList(!openEmojiList)}>
                <EmojiIcon />
            </IconButton>
            <IconButton>
                <ShareIcon />
            </IconButton>
        </Box>
    );
};

///////////////////////////////////////////////////////////////////////////////////////////////////////

interface MessageReactionsProps {
    reactions: reakcijanaporuku[],
}

const MessageReactions: React.FC<MessageReactionsProps> = ({ reactions }) => {
    const reactionsMap = new Map<string, number>();
    for (const reaction of reactions) {
        if (reactionsMap.has(reaction.emoticon))
            reactionsMap.set(reaction.emoticon, reactionsMap.get(reaction.emoticon)! + 1);
        else reactionsMap.set(reaction.emoticon, 1);
    }
    return (
        <Paper elevation={5} sx={{ position: 'absolute', display: 'flex', bottom: '-1.25rem', right: 0 }}>
            {Array.from(reactionsMap.keys()).map((key, i) => (
                <Stack direction='row' key={i}>
                    <Typography>{key}</Typography>
                    <Typography>{reactionsMap.get(key)}</Typography>
                </Stack>
            ))}
        </Paper>
    );
};

///////////////////////////////////////////////////////////////////////////////////////////////////////

export interface Props {
    msg: IMessage,
    user: korisnik,
    idChat: number,
};

const Message: React.FC<Props> = ({ msg, user, idChat }) => {

    const theme = useColorTheme().getTheme();
    return (
        <React.Fragment>
            <Attachments attachmenturls={msg.attachments} myAttachments={msg.posiljatelj.idkorisnik === user.idkorisnik} />
            <Stack direction='row' spacing='0.5rem' alignItems='center'>
                <Paper sx={{
                    padding: '1rem', width: 'fit-content', borderRadius: '1rem', position: 'relative', // relative radi reactions
                    backgroundColor: (msg.posiljatelj.idkorisnik === user.idkorisnik) ? theme.palette.primary.main : undefined, // boja korisnikovih poruka je prema themu
                    ml: (msg.posiljatelj.idkorisnik === user.idkorisnik) ? 'auto' : 0 // poruke trenutnog usera su na desnoj strani, ostali na ljevoj
                }}
                >
                    <Stack direction='row' spacing='1rem'>
                        <AvatarImage url={msg.posiljatelj.avatarurl} width='64px' height='64px' />
                        <Stack direction='column' sx={{ maxWidth: 'calc(100vw / 3)' }}>
                            <Typography variant='caption'>
                                {msg.timestamp}
                            </Typography>
                            <Typography variant='body1' fontWeight='bold' style={{ wordWrap: 'break-word' }}>
                                {msg.posiljatelj.korisnickoime}
                            </Typography>
                            <Stack direction='column' justifyContent='center' flex='1'>
                                <Typography variant='body2' style={{ wordWrap: 'break-word' }}>
                                    {msg.tekst}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Stack>
                    <MessageReactions reactions={msg.reactions} />
                </Paper>
                {msg.posiljatelj.idkorisnik !== user.idkorisnik ?
                    <MessageActions idPoruka={msg.idMsg} idChat={idChat} />
                    : null
                }
            </Stack>
        </React.Fragment>
    );
};

export default Message;