import React, { useEffect, useState, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/theme/material.css'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/css/css'
import ACTIONS from '../Actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCompressAlt, faExpandAlt } from '@fortawesome/free-solid-svg-icons'
const Editor = ({ socketRef, roomId, onhtmlCodeChange, onCssCodeChange, onJsCodeChange, refresher, refreshState }) => {
    const htmlEditorRef = useRef(null);
    const cssEditorRef = useRef(null);
    const jsEditorRef = useRef(null);
    const [openHtml, setOpenHtml] = useState(true)
    const [openCss, setOpenCss] = useState(true)
    const [openJs, setOpenJs] = useState(true)
    useEffect(() => {
        async function init() {
            htmlEditorRef.current = Codemirror.fromTextArea(
                document.getElementById('htmlRealtimeEditor'),
                {
                    mode: 'xml', 
                    theme: 'material',
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                    lineWrapping: true,
                    lint: true,
                }
            );

            htmlEditorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const htmlCode = instance.getValue();
                onhtmlCodeChange(htmlCode);
                refresher(refreshState => refreshState + 1);
                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.HTML_CODE_CHANGE, {
                        roomId,
                        htmlCode,
                    });
                }
            });
            cssEditorRef.current = Codemirror.fromTextArea(
                document.getElementById('cssRealtimeEditor'),
                {
                    mode: 'css', 
                    theme: 'dracula',
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                    lineWrapping: true,
                    lint: true,
                }
            );

            cssEditorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const cssCode = instance.getValue();
                onCssCodeChange(cssCode);
                refresher(refreshState => refreshState + 1);
                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.CSS_CODE_CHANGE, {
                        roomId,
                        cssCode,
                    });
                }
            });
            jsEditorRef.current = Codemirror.fromTextArea(
                document.getElementById('jsRealtimeEditor'),
                {
                    mode: { name: 'javascript', json: true },
                    theme: 'dracula',
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                    lineWrapping: true,
                    lint: true,
                }
            );
            jsEditorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const jsCode = instance.getValue();
                onJsCodeChange(jsCode);
                refresher(refreshState => refreshState + 1);
                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.JS_CODE_CHANGE, {
                        roomId,
                        jsCode,
                    });
                }
            });
        }
        init();    
    }, []);

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.HTML_CODE_CHANGE, ({ htmlCode }) => {
                if (htmlCode !== null) {
                    htmlEditorRef.current.setValue(htmlCode);
                }
            });
            socketRef.current.on(ACTIONS.CSS_CODE_CHANGE, ({ cssCode }) => {
                if (cssCode !== null) {
                    cssEditorRef.current.setValue(cssCode);
                }
            });
            socketRef.current.on(ACTIONS.JS_CODE_CHANGE, ({ jsCode }) => {
                if (jsCode !== null) {
                    jsEditorRef.current.setValue(jsCode);
                }
            });
            
        }

        
        return () => {
            socketRef.current.off(ACTIONS.HTML_CODE_CHANGE);
            socketRef.current.off(ACTIONS.CSS_CODE_CHANGE);
            socketRef.current.off(ACTIONS.JS_CODE_CHANGE);
        };
    }, [socketRef.current]);

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.SYNC_CODE, ({ htmlCode, cssCode, jsCode}) => {
                htmlEditorRef.current.setValue(htmlCode);
                cssEditorRef.current.setValue(cssCode);
                jsEditorRef.current.setValue(jsCode);
            });
            
        }

        
        return () => {
            socketRef.current.off(ACTIONS.SYNC_CODE);
        };
    },[socketRef.current] );

    return <>

    <div className={`editor-container ${openHtml ? '' : 'collapsed'}`}>
      <div className="editor-title">
        HTML
        <button
          type="button"
          className="expand-collapse-btn"
          onClick={() => setOpenHtml(prevOpen => !prevOpen)}
        >
          <FontAwesomeIcon icon={openHtml ? faCompressAlt : faExpandAlt} />
        </button>
      </div>
    <textarea id="htmlRealtimeEditor"></textarea>
    </div>
  
    <div className={`editor-container ${openCss ? '' : 'collapsed'}`}>
      <div className="editor-title">
        CSS
        <button
          type="button"
          className="expand-collapse-btn"
          onClick={() => setOpenCss(prevOpen => !prevOpen)}
        >
          <FontAwesomeIcon icon={openCss ? faCompressAlt : faExpandAlt} />
        </button>
      </div>
    <textarea id="cssRealtimeEditor"></textarea>
    
    </div>
  
    <div className={`editor-container ${openJs ? '' : 'collapsed'}`}>
      <div className="editor-title">
        javascript
        <button
          type="button"
          className="expand-collapse-btn"
          onClick={() => setOpenJs(prevOpen => !prevOpen)}
        >
          <FontAwesomeIcon icon={openJs ? faCompressAlt : faExpandAlt} />
        </button>
      </div>
    <textarea id="jsRealtimeEditor"></textarea>
    </div>
    </>
};

export default Editor;

