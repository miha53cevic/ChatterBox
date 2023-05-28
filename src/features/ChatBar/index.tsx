import * as React from 'react';
import { Box, IconButton, Menu, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import AddPersonIcon from '@mui/icons-material/PersonAddAlt1';
import LeaveGroupIcon from '@mui/icons-material/ExitToApp';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import AddPhotoIcon from '@mui/icons-material/AddPhotoAlternate';
import CancelIcon from '@mui/icons-material/Cancel';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useForm } from "react-hook-form";
import { korisnik } from '@prisma/client';
import { mutate } from 'swr';

import { ControlledOutlineTextfield } from "../../components/Controlled/ControlledTextfield";
import LoadingButton from "../../components/LoadingButton";
import AvatarImage from '../../components/AvatarImage';
import socket from '../../lib/SocketIOClient';
import FriendListItem from '../FriendListItem';
import { Deleter, Fetcher, Poster } from '../../lib/Fetcher';
import useErrorAlert from '../../hooks/useErrorAlert';
import DialogCustomForm from '../../components/Dialogs/CustomForm';
import { ChooseGroupFriends, GroupChatFormData } from '../ChatList';
import useDesktop from '../../hooks/useDesktop';
import { S3Upload } from '../../lib/S3Bucket';
import Message from '../Message';

import { ApiGetForChatMessages, Chat } from "../../types/apiTypes";
import { IConnectedUser, IMessage, IReaction } from '../../types';

///////////////////////////////////////////////////////////////////////////////////////////////////////

interface ChatBarHeaderProps {
    selectedChat: Chat,
    closeChat: () => void,
    connectedUsers: IConnectedUser[],
};

const ChatBarHeader: React.FC<ChatBarHeaderProps> = ({ selectedChat, closeChat, connectedUsers }) => {

    const showError = useErrorAlert();

    ///////////////////////////////////////////////////////////////////////////////////////
    React.useEffect(() => {
        setDisplayGroupName(selectedChat.nazivGrupe);
    }, [selectedChat]);

    const [editGroupName, setEditGroupName] = React.useState(false);
    const [displayGroupName, setDisplayGroupName] = React.useState(selectedChat.nazivGrupe);
    const [newGroupName, setNewGroupName] = React.useState("");
    const handleGroupNameChange = async () => {
        setEditGroupName(false);
        try {
            const res = await Poster('/api/group/changeName', { arg: { idGroup: selectedChat.idrazgovor, newGroupName: newGroupName } });
            mutate('/api/chats');
            setDisplayGroupName(newGroupName);
        } catch (err) {
            console.error(err);
            showError("Couldn't change group name!");
        }
    };
    const handleGroupLeave = async () => {
        try {
            const res = await Deleter(`/api/group/leaveGroup/${selectedChat.idrazgovor}`)
            mutate('/api/chats');
            closeChat();
        } catch (err) {
            console.error(err);
            showError("Error on leaveing group, please try again!");
        }
    };
    const [openDialog, setOpenDialog] = React.useState(false);
    const addSudionik = useForm<GroupChatFormData>();
    const handleAddSudionik = async (data: GroupChatFormData) => {
        if (data.idSudionici.length < 1) return;

        for (const i of data.idSudionici) {
            if (selectedChat.pripadarazgovoru.some(r => r.idkorisnik === i)) {
                const korisnik = selectedChat.pripadarazgovoru.filter(user => user.idkorisnik === i);
                showError(`User: ${korisnik[0].korisnik.korisnickoime} is already in group chat!`);
                return;
            }
        }

        try {
            const res = await Poster('/api/group/addUsersToGroup', { arg: { idGroup: selectedChat.idrazgovor, idUsers: data.idSudionici } });
        } catch (err) {
            console.error(err);
            showError("Error on adding a new friend to group chat, try again later.");
        }
    };
    const handleAddGroupPhoto: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
        if (!e.target.files) return;

        const file = e.target.files[0];
        const ext = e.target.files[0].type.split('/')[1];

        const idChat = selectedChat.idrazgovor;
        try {
            const response = await S3Upload(`groupAvatar_${idChat}.${ext}`, file);
            const res = await Poster('/api/group/changeAvatar', { arg: { idGroup: idChat, avatarurl: `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}/groupAvatar_${idChat}.${ext}` } })
            mutate('/api/chats'); // update chat list
            selectedChat.avatarurl = `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}/groupAvatar_${idChat}.${ext}`;
        } catch (err) {
            showError("Error changing group avatar, try again later");
        }
        handleMenuClose();
    };
    // Menu for group options
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);
    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    ///////////////////////////////////////////////////////////////////////////////////////

    const desktop = useDesktop();
    if (selectedChat.grupa) {
        return (
            <>
                <DialogCustomForm
                    open={openDialog}
                    handleClose={() => setOpenDialog(false)}
                    title="Add new friend to chat"
                    text=""
                    submitText="Add friend to chat"
                    submitForForm='form'
                >
                    <form onSubmit={addSudionik.handleSubmit(handleAddSudionik)} id='form'>
                        <ChooseGroupFriends setValue={addSudionik.setValue} />
                    </form>
                </DialogCustomForm>
                <Box sx={{ my: '1rem', mr: 2 }}>
                    <Stack direction='row' sx={{ my: '1rem', mr: 2, width: '100%' }} spacing='1rem'>
                        <AvatarImage url={selectedChat.avatarurl} />
                        <Stack direction='row' flex='1' alignSelf='center' alignItems='center' spacing='1rem'>
                            {editGroupName ?
                                <>
                                    <TextField variant='standard' defaultValue={displayGroupName} onChange={(e) => setNewGroupName(e.target.value)} fullWidth />
                                    <IconButton onClick={() => handleGroupNameChange()}>
                                        <CheckIcon />
                                    </IconButton>
                                    <IconButton onClick={() => setEditGroupName(false)}>
                                        <CancelIcon />
                                    </IconButton>
                                </>
                                :
                                <>
                                    <Typography variant='h4'>{displayGroupName}</Typography>
                                    <Box>
                                        <IconButton onClick={() => setEditGroupName(true)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Box>
                                </>
                            }
                        </Stack>
                        <Stack direction='row' alignItems='center' spacing='0.5rem'>
                            <Box>
                                <IconButton onClick={handleMenuClick}>
                                    <MoreVertIcon fontSize={desktop ? 'large' : 'medium'} />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={openMenu}
                                    onClose={handleMenuClose}
                                >
                                    <MenuItem onClick={() => { setOpenDialog(true); handleMenuClose(); }}>
                                        <AddPersonIcon sx={{ mr: '1rem' }} fontSize="large" />
                                        <Typography>
                                            Add to group
                                        </Typography>
                                    </MenuItem>
                                    <MenuItem component='label'>
                                        <AddPhotoIcon sx={{ mr: '1rem' }} fontSize="large" />
                                        <Typography>
                                            Change avatar
                                            <input
                                                type='file'
                                                accept="image/*"
                                                onChange={handleAddGroupPhoto}
                                                hidden
                                            />
                                        </Typography>
                                    </MenuItem>
                                    <MenuItem onClick={() => { handleGroupLeave(); handleMenuClose(); }}>
                                        <LeaveGroupIcon sx={{ mr: '1rem' }} fontSize='large' />
                                        <Typography>
                                            Leave group
                                        </Typography>
                                    </MenuItem>
                                </Menu>
                            </Box>
                            <IconButton onClick={closeChat}>
                                <CloseIcon fontSize={desktop ? 'large' : 'medium'} />
                            </IconButton>
                        </Stack>
                    </Stack>
                </Box>
            </>
        );
    } else {
        const korisnik = selectedChat.pripadarazgovoru[0].korisnik;
        const connectedUser = connectedUsers.find(i => i.user.idkorisnik === korisnik.idkorisnik);
        const status = connectedUser ? connectedUser.status : 'offline';
        return (
            <Box sx={{ my: '1rem', mr: 2 }}>
                <FriendListItem user={korisnik} userStatus={status}>
                    <IconButton onClick={closeChat}>
                        <CloseIcon fontSize="large" />
                    </IconButton>
                </FriendListItem>
            </Box>
        );
    }
};

///////////////////////////////////////////////////////////////////////////////////////////////////////

export interface AddChatFormData {
    message: string,
};

export interface Props extends ChatBarHeaderProps {
    user: korisnik,
    readAllInChat: (idChat: number) => void,
};

const ChatBar: React.FC<Props> = ({ user, selectedChat, closeChat, connectedUsers, readAllInChat }) => {

    const [messages, setMessages] = React.useState<IMessage[]>([]);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    ////////////////////////////////////////////////////////////////////////////////////////

    // Get all messages from db
    React.useEffect(() => {
        // Reset saved messages from previously open chat
        setMessages([]);
        setUploadFiles([]); // Reset file upload

        (async () => {
            try {
                const messages = await Fetcher<ApiGetForChatMessages>(`/api/messages/${selectedChat.idrazgovor}`);
                const formatedMessages = messages.map(msg => ({
                    idChat: msg.idrazgovor,
                    idMsg: msg.idporuka,
                    posiljatelj: msg.korisnik,
                    tekst: msg.tekst,
                    timestamp: new Date(msg.timestamp as unknown as string).toLocaleString(),
                    reactions: msg.reakcijanaporuku,
                    attachments: msg.multimedijalnizapis.map(attachment => attachment.url),
                } as IMessage));
                setMessages([...formatedMessages]);
            } catch (err) {
                console.error(err);
            }
        })();
    }, [selectedChat]);

    // subscribe to messages received & add new real time messages
    React.useEffect(() => {
        // Join room just in case it's a newly created one
        socket.emit('joinChat', selectedChat.idrazgovor);

        const saveReceivedMessage = async (msg: IMessage) => {
            // Check if this is a message for selectedChat
            if (msg.idChat === selectedChat.idrazgovor) {
                setMessages(oldMessages => [...oldMessages, msg]);
            }
        };
        socket.on('message', saveReceivedMessage);

        return () => {
            socket.off('message', saveReceivedMessage); // makni samo ovaj listener na message, a ne i sve
        };
    }, [user, selectedChat]);

    // Scroll to new message
    React.useEffect(() => {
        if (!messagesEndRef.current) return;
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        console.log("Scrolling to new message");
    }, [messages, selectedChat]);

    // Set last message
    React.useEffect(() => {
        if (messages.length === 0) return;
        (async () => {
            // Postavi da je to lastReadMessage na incomin message dok je taj chat window otvoren
            try {
                const lastMessage = messages[messages.length - 1];
                await Poster('/api/last_read_message/', { arg: { idChat: lastMessage.idChat, idPoruka: lastMessage.idMsg } })
            } catch (err) {
                console.error(err);
            }
            // Remove all notifications (all messages are read)
            readAllInChat(messages[0].idChat);
        })();
    }, [messages, readAllInChat]);

    // Get real time reaction
    React.useEffect(() => {
        socket.on('reaction', (reaction: IReaction) => {
            // Find the chat and add the reaction to it
            setMessages(curMessages => {
                const msg = curMessages.find(m => m.idMsg === reaction.idporuka);
                if (!msg) return curMessages;
                msg.reactions.push(reaction);
                return structuredClone(curMessages);
            });
        });
        return () => {
            socket.off('reaction');
        };
    }, []);

    ////////////////////////////////////////////////////////////////////////////////////////

    // On message send
    const { control, handleSubmit, reset } = useForm<AddChatFormData>();
    const onSubmit = async (data: AddChatFormData) => {
        reset();

        // Upload attachments TODO, stavi na S3, mozda hash po imenu + salt, na socketServeru stavi u bazu
        const attachmenturls = [];
        if (uploadFiles.length > 0) {
            try {
                for (const file of uploadFiles) {
                    const filename = `attachment_${file.name}`;
                    await S3Upload(filename, file);
                    attachmenturls.push(`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}/${filename}`);
                }
                setUploadFiles([]);
            } catch(err) {
                console.error(err);
            }
        }

        socket.emit('message', {
            idChat: selectedChat.idrazgovor,
            idMsg: -1, // later set to real id in socketServer
            tekst: data.message,
            posiljatelj: user,
            timestamp: new Date().toLocaleString(),
            reactions: [], // inicijalno nema reakcija, i to se koristi samo dok se dohvate poruke iz db orginalno
            attachments: attachmenturls,
        } as IMessage);
    };

    ////////////////////////////////////////////////////////////////////////////////////////

    const fileDropAreaRef = React.useRef<HTMLDivElement>(null);
    const [uploadFiles, setUploadFiles] = React.useState<File[]>([]);

    const removeUploadFile = (index: number) => {
        setUploadFiles(old => [...old.filter((f, i) => i !== index)]);
    };

    const handleFileDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
        e.preventDefault();
        if (!fileDropAreaRef.current) return;

        fileDropAreaRef.current.style.display = 'none';

        const fileList = e.dataTransfer.files;
        const files: File[] = [];
        for (let i = 0; i < fileList.length; i++) {
            files.push(fileList.item(i)!);
        }
        console.log(files);
        setUploadFiles(oldFiles => [...oldFiles, ...files]);
    };

    const handleOnFileDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
        e.preventDefault(); // prevent file open behaviour
        if (!fileDropAreaRef.current) return;
        fileDropAreaRef.current.style.display = 'block';
    };

    const handleOnFileDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
        e.preventDefault();
        if (!fileDropAreaRef.current) return;
        fileDropAreaRef.current.style.display = 'none';
    };

    ////////////////////////////////////////////////////////////////////////////////////////

    return (
        <Stack direction='column' height='100%' maxHeight='100vh' position='relative' onDrop={handleFileDrop} onDragOver={handleOnFileDragOver} onDragLeave={handleOnFileDragLeave}>
            <div ref={fileDropAreaRef} id='fileDropArea' style={{ display: 'none', position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 999 }}>
                <CloudUploadIcon sx={{ fontSize: '20rem', transform: 'translate(-50%, -50%)', top: '50%', left: '50%', position: 'absolute' }} />
            </div>
            <Paper sx={{ px: '2rem' }}>
                <ChatBarHeader selectedChat={selectedChat} closeChat={closeChat} connectedUsers={connectedUsers} />
            </Paper>
            <Box flex='1' sx={{ padding: '2rem', overflowY: 'auto' }}>
                {messages.map((msg, i) => (
                    <React.Fragment key={i}>
                        <Message msg={msg} user={user} idChat={selectedChat.idrazgovor} />
                        <br />
                    </React.Fragment>
                ))}
                <div id='messagesEnd' ref={messagesEndRef}></div>
            </Box>
            <Paper sx={{ padding: '2rem', overflowY: 'auto' }}>
                <Stack direction='column' spacing='1rem'>
                    {uploadFiles.map((file, i) => (
                        <Stack direction='row' alignItems='center' spacing='0.5rem' key={i}>
                            <Typography>{file.name}</Typography>
                            <IconButton onClick={() => removeUploadFile(i)}>
                                <CloseIcon />
                            </IconButton>
                        </Stack>
                    ))}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack direction='row'>
                            <ControlledOutlineTextfield control={control} name="message" variant="outlined" label='Message' multiline fullWidth required />
                            <LoadingButton variant="contained" loading={false} type="submit"><ChatBubbleIcon /></LoadingButton>
                        </Stack>
                    </form>
                </Stack>
            </Paper>
        </Stack>
    );
};

export default ChatBar;