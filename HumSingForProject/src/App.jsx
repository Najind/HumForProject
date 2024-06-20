import { useState , useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'

function App() {
  const [data, setData] = useState({})
  const [recording, setRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  let mediaRecorder;
  let audioChunks = [];

  useEffect(() => {

    axios.get('http://localhost:3000/api/data').then (res => {
      setData(res.data);
    }).catch(err =>{
      console.error("Error fetching data: ", err)
    })
  },[] )

  const startRecording = async () => {
    setRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const formData = new FormData();
      formData.append('file', audioBlob);

      const response = await fetch('http://localhost:8000/search_song/', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.length > 0) {
        const videoId = result[0].id.videoId;
        setVideoUrl(`https://www.youtube.com/watch?v=${videoId}`);
      }

      audioChunks = [];
    };
  };

  const stopRecording = () => {
    setRecording(false);
    mediaRecorder.stop();
  };

  return (
    <>
     <div>
     <button onClick={recording ? stopRecording : startRecording}>
        {recording ? 'Stop Recording' : 'Start Recording'}
      </button>
      {videoUrl && <iframe src={videoUrl} title="YouTube video" />}
     </div>
    </>
  )
}

export default App
