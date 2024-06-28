import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../style/CodeEditor.css';

const CodeEditor = ({ teamId, username }) => {
    const [html, setHtml] = useState(localStorage.getItem('html_code') || '');
    const [css, setCss] = useState(localStorage.getItem('css_code') || '');
    const [js, setJs] = useState(localStorage.getItem('js_code') || '');
    const [srcDoc, setSrcDoc] = useState('');
    const ws = useRef(null);

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:8080');

        ws.current.onopen = () => {
            ws.current.send(JSON.stringify({ type: 'join', username, teamId }));
        };

        ws.current.onmessage = (event) => {
            const { type, language, value } = JSON.parse(event.data);
            if (type === 'code') {
                if (language === 'html') setHtml(value);
                if (language === 'css') setCss(value);
                if (language === 'js') setJs(value);
            } else if (type === 'error') {
                alert(value);
                ws.current.close();
            }
        };

        return () => {
            ws.current.close();
        };
    }, [teamId, username]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setSrcDoc(`
                <html>
                    <body>${html}</body>
                    <style>${css}</style>
                    <script>${js}</script>
                </html>
            `);
        }, 250);

        return () => clearTimeout(timeout);
    }, [html, css, js]);

    const handleEditorChange = (value, language) => {
        if (language === 'html') {
            setHtml(value);
            localStorage.setItem('html_code', value);
            ws.current.send(JSON.stringify({ type: 'code', language: 'html', value, teamId }));
        } else if (language === 'css') {
            setCss(value);
            localStorage.setItem('css_code', value);
            ws.current.send(JSON.stringify({ type: 'code', language: 'css', value, teamId }));
        } else if (language === 'javascript') {
            setJs(value);
            localStorage.setItem('js_code', value);
            ws.current.send(JSON.stringify({ type: 'code', language: 'javascript', value, teamId }));
        }
    };

    const handleSaveFiles = () => {
        const htmlBlob = new Blob([html], { type: 'text/html' });
        const cssBlob = new Blob([css], { type: 'text/css' });
        const jsBlob = new Blob([js], { type: 'text/javascript' });

        const htmlUrl = URL.createObjectURL(htmlBlob);
        const cssUrl = URL.createObjectURL(cssBlob);
        const jsUrl = URL.createObjectURL(jsBlob);

        const downloadHtml = document.createElement('a');
        downloadHtml.href = htmlUrl;
        downloadHtml.download = 'index.html';
        downloadHtml.click();

        const downloadCss = document.createElement('a');
        downloadCss.href = cssUrl;
        downloadCss.download = 'styles.css';
        downloadCss.click();

        const downloadJs = document.createElement('a');
        downloadJs.href = jsUrl;
        downloadJs.download = 'script.js';
        downloadJs.click();

        URL.revokeObjectURL(htmlUrl);
        URL.revokeObjectURL(cssUrl);
        URL.revokeObjectURL(jsUrl);
    };

    return (
        <>
            <div className="editor-container">
                <div className="editor-sections">
                    <div className="editor">
                        <h1>HTML</h1>
                        <MonacoEditor
                            height="200px"
                            language="html"
                            theme="vs-dark"
                            value={html}
                            onChange={(value) => handleEditorChange(value, 'html')}
                        />
                    </div>
                    <div className="editor">
                        <h1>CSS</h1>
                        <MonacoEditor
                            height="200px"
                            language="css"
                            theme="vs-dark"
                            value={css}
                            onChange={(value) => handleEditorChange(value, 'css')}
                        />
                    </div>
                    <div className="editor">
                        <h1>JavaScript</h1>
                        <MonacoEditor
                            height="200px"
                            language="javascript"
                            theme="vs-dark"
                            value={js}
                            onChange={(value) => handleEditorChange(value, 'javascript')}
                        />
                    </div>
                </div>
                <iframe
                    id="result"
                    srcDoc={srcDoc}
                    title="result"
                    sandbox="allow-scripts"
                    frameBorder="0"
                    width="100%"
                    height="100%"
                />
            </div>
            <div className="save-button">
                <a className='back' href='/code-editor/profile'>
                    <FontAwesomeIcon icon={faArrowLeft} /> Go to Profile
                </a>
                <button onClick={handleSaveFiles}>Save Files</button>
            </div>
        </>
    );
};

export default CodeEditor;
