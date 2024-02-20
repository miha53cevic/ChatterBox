/* eslint-disable @next/next/no-img-element */
import * as React from 'react';
import { Stack, Paper, Typography, Box, IconButton, Checkbox, CircularProgress, FormControlLabel, FormGroup, TextField } from '@mui/material';
import EmojiIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import { korisnik, reakcijanaporuku } from '@prisma/client';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';

import AvatarImage from '../../components/AvatarImage';
import useColorTheme from '../../hooks/useColorTheme';
import useErrorAlert from '../../hooks/useErrorAlert';
import { Fetcher, Poster } from '../../lib/Fetcher';
import DialogCustomForm from '../../components/Dialogs/CustomForm';
import FriendListItem from '../FriendListItem';
import socket from '../../lib/SocketIOClient';

import { IMessage } from '../../types';
import { ApiChats } from '../../types/apiTypes';

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
                const isImage = true;
                return (
                    <Paper key={i} sx={{ width: 'fit-content', ml: myAttachments ? 'auto' : 0 }}>
                        {isImage ?
                            <img src={url} style={{ maxWidth: '400px', maxHeight: '400px' }} alt='attachment_image' />
                            :
                            <a href={url}>
                                <Stack direction='column' alignItems='center' sx={{ p: '4rem' }}>
                                    <Typography>Attachment</Typography>
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

interface ShareMessageDialogProps {
    open: boolean,
    handleClose: () => void,
    msg: IMessage,
    user: korisnik,
};

const ShareMessageDialog: React.FC<ShareMessageDialogProps> = ({ open, handleClose, msg, user }) => {
    const [search, setSearch] = React.useState("");
    const [selected, setSelected] = React.useState<number[]>([]);
    const handleSelect = (id: number, checked: boolean) => {
        if (!checked) {
            setSelected(oldData => oldData.filter(i => i !== id));
        }
        else {
            setSelected(oldData => [id, ...oldData]);
        }
    };
    interface FormData {
        idChats: number[],
    }
    const { setValue, handleSubmit } = useForm<FormData>();
    const onSubmit = async ({ idChats }: FormData) => {
        for (const idChat of idChats) {
            const shareMsg = structuredClone(msg);
            shareMsg.idMsg = -1;
            shareMsg.posiljatelj = user;
            shareMsg.timestamp = new Date().toLocaleString();
            shareMsg.reactions = [];
            shareMsg.idChat = idChat;
            socket.emit('message', shareMsg);
        }
    };

    React.useEffect(() => {
        setValue('idChats', selected);
    }, [selected, setValue]);

    const { data, isLoading, error } = useSWR('/api/chats', Fetcher<ApiChats>);
    if (error) return <pre>{JSON.stringify(error)}</pre>;
    if (!data) return <b>Data does not exist!</b>;
    return (
        <DialogCustomForm
            open={open}
            handleClose={handleClose}
            title='Send to'
            text=''
            submitText='Share'
            submitForForm='shareForm'
        >
            <form id='shareForm' onSubmit={handleSubmit(onSubmit)}>
                <TextField variant='filled' label='Search...' onChange={(e) => setSearch(e.target.value.toLowerCase())} fullWidth />
                <FormGroup>
                    {isLoading ?
                        <CircularProgress />
                        :
                        data.map(item => {
                            if (msg.idChat === item.idrazgovor) return; // ne prikazuj trenutni chat
                            const korisnik = item.pripadarazgovoru[0].korisnik;
                            // Ako je grupa postavi da je username nazivGrupe i avatarurl od grupe
                            if (item.grupa) {
                                korisnik.korisnickoime = item.nazivGrupe!;
                                korisnik.avatarurl = item.avatarurl;
                            }
                            return (
                                <Box key={item.idrazgovor} display={korisnik.korisnickoime.toLowerCase().includes(search) ? undefined : 'none'}>
                                    <FriendListItem user={korisnik}>
                                        <FormControlLabel control={<Checkbox onChange={(e, checked) => handleSelect(item.idrazgovor, checked)} />} label='' />
                                    </FriendListItem>
                                </Box>
                            );
                        })
                    }
                </FormGroup>
            </form >
        </DialogCustomForm>
    );
};

interface MessageActionsProps {
    msg: IMessage,
    user: korisnik,
}

const emojis = ["😀", "😂", "🙃", "😢", "😫"];

const MessageActions: React.FC<MessageActionsProps> = ({ msg, user }) => {

    const showError = useErrorAlert();

    const [openShareDialog, setOpenShareDialog] = React.useState(false);
    const [openEmojiList, setOpenEmojiList] = React.useState(false);

    const handleEmojiSelect = async (emoji: string) => {
        setOpenEmojiList(false);
        try {
            const reaction = await Poster('/api/reactions', { arg: { emoji: emoji, idPoruka: msg.idMsg } });
            // Notify other users about the reaction
            socket.emit('reaction', { idChat: msg.idChat, ...reaction });
        } catch (err) {
            showError('Could not add reaction!');
        }
    };

    return (
        <>
            <ShareMessageDialog open={openShareDialog} handleClose={() => setOpenShareDialog(false)} msg={msg} user={user} />
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
                <IconButton onClick={() => setOpenShareDialog(true)}>
                    <ShareIcon />
                </IconButton>
            </Box>
        </>
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
};

const Message: React.FC<Props> = ({ msg, user }) => {
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
                    <MessageActions msg={msg} user={user} />
                    : null
                }
            </Stack>
        </React.Fragment>
    );
};

export default Message;