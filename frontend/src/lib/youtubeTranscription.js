import { YoutubeTranscript } from 'youtube-transcript';

export const transcribeYouTubeVideo = async (videoUrl) => {
    console.log(videoUrl);

    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoUrl);
        if (!transcript || transcript.length === 0) {
            throw new Error("No captions available");
        }
        return transcript.map(item => item.text).join(' ');
    } catch (error) {
        console.error("Error fetching YouTube transcript:", error.message);
        throw error;
    }
};


// const result = await transcribeYouTubeVideo('https://youtu.be/TBxS0XhdfmU?si=bNJ8zc5GTypQGVS_');
// console.log(result);
