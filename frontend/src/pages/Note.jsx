import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import GPTScreen from '../pages/Home'
const MainLayout = () => {
    return (
        <div className="flex w-[99vw] h-[100vh]">
            <NoteEditor />
            <div className="w-1/2 p-4 bg-gray-100">
                {/* Right side home screen content */}
                <GPTScreen/>
            </div>
        </div>
    );
};

const NoteEditor = () => {
    const [content, setContent] = useState('');

    // Load saved content on component mount
    useEffect(() => {
        const savedContent = localStorage.getItem('savedNote');
        if (savedContent) {
            setContent(savedContent);
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('savedNote', content);
        alert('Note saved successfully!');
    };

    // Quill editor modules configuration
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image'],
            [{ 'color': [] }, { 'background': [] }],
            ['clean']
        ]
    };

    return (
        <div className="w-1/2  p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Rich Text Editor</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <ReactQuill
                            theme="snow"
                            value={content}
                            onChange={setContent}
                            modules={modules}
                            className="min-h-[400px]"
                        />
                    </div>
                    <Button 
                        onClick={handleSave}
                        className="w-full mt-4"
                    >
                        Save Note
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default MainLayout;
