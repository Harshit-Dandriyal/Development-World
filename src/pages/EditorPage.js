import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import ACTIONS from '../Actions';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import {
    useLocation,
    useNavigate,
    Navigate,
    useParams,
} from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage'
const EditorPage = () => {
    const socketRef = useRef(null);
    const htmlCodeRef =  useRef(null);
    const cssCodeRef = useRef(null);
    const jsCodeRef = useRef(null);
    const [refresh, setRefresh] = useState(0);
    const location = useLocation();
    const { roomId } = useParams();
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);
    const [srcDoc, setSrcDoc] = useState('')

    useEffect(() => {
        console.log("Code", htmlCodeRef)
        const timeout = setTimeout(() => {
          setSrcDoc(`
            <html>
              <body>${htmlCodeRef.current}</body>
              <style>${cssCodeRef.current}</style>
              <script>${jsCodeRef.current}</script>
            </html>
          `)
        }, 250)
    
        return () => clearTimeout(timeout)
      }, [htmlCodeRef.current, cssCodeRef, jsCodeRef, refresh])

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username,
            });

            // Listening for joined event
            socketRef.current.on(
                ACTIONS.JOINED,
                ({ clients, username, socketId }) => {
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the room.`);
                        console.log(`${username} joined`);
                    }
                    setClients(clients);
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        htmlCode: htmlCodeRef.current,
                        cssCode:  cssCodeRef.current,
                        jsCode: jsCodeRef.current,
                        socketId,
                    });
                }
            );

            // Listening for disconnected
            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketId, username }) => {
                    toast.success(`${username} left the room.`);
                    setClients((prev) => {
                        return prev.filter(
                            (client) => client.socketId !== socketId
                        );
                    });
                }
            );
        };
        init();
        return () => {
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
        };
    }, []);

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
            console.error(err);
        }
    }

    function leaveRoom() {
        reactNavigator('/');
    }

    if (!location.state) {
        return <Navigate to="/" />;
    }

    return (

        <div className="mainWrap">
            <div className="aside">
                <div className="asideInner">
                    <div className="logo">
                    <div style={{display: 'flex', fontFamily: 'monospace'}}>
                <img
                    className="homePageLogo"
                    src="/pair.png"
                    alt="code-pair-logo"
                />
                <span><h2>Code-Pair</h2></span>
                </div>
                    </div>
                    <h3>Connected</h3>
                    <div className="clientsList">
                        {clients.map((client) => (
                            <Client
                                key={client.socketId}
                                username={client.username}
                            />
                        ))}
                    </div>
                </div>
                <button className="btn copyBtn" onClick={copyRoomId}>
                    Copy ROOM ID
                </button>
                <button className="btn leaveBtn" onClick={leaveRoom}>
                    Leave
                </button>
            </div>
            <div className="editorPainWrap">
                <div className="editorWrap">
                <Editor
                    socketRef={socketRef}
                    roomId={roomId}
                    onhtmlCodeChange={(htmlCode) => {
                        htmlCodeRef.current= htmlCode;
                    }}
                    onCssCodeChange={(cssCode) => {
                        cssCodeRef.current= cssCode;
                    }}
                    onJsCodeChange={(jsCode) => {
                        jsCodeRef.current= jsCode;
                    }}
                    refresher={setRefresh}
                    refreshState={refresh}
                />
                </div>
    <div className="pane">
         <iframe
           srcDoc={srcDoc}
           title="output"
           sandbox="allow-scripts"
           frameBorder="0"
           width="100%"
           height="100%"
         />
       </div>
            </div>
        
        </div>

    );
};

export default EditorPage;
