import { useState, useRef } from "react";
import "./App.css";

const App = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [trimmedVideoUrl, setTrimmedVideoUrl] = useState(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);

  const videoRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setVideoFile(URL.createObjectURL(file));
  };

  const trimVideo = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const mediaRecorder = new MediaRecorder(video.captureStream(), {
      mimeType: "video/webm",
    });
    const chunks = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const trimmedUrl = URL.createObjectURL(
        new Blob(chunks, { type: "video/webm" })
      );
      setTrimmedVideoUrl(trimmedUrl);
    };

    mediaRecorder.start();
    video.currentTime = startTime;
    video.play();

    video.ontimeupdate = () => {
      if (video.currentTime >= endTime) {
        video.pause();
        mediaRecorder.stop();
      }
    };
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    if (name === "start") setStartTime(Number(value));
    if (name === "end") setEndTime(Number(value));
  };

  const saveTrimmedVideo = () => {
    if (trimmedVideoUrl) {
      const link = document.createElement("a");
      link.href = trimmedVideoUrl;
      link.download = "trimmed-video.webm";
      link.click();
    }
  };

  return (
    <div className="app">
      <div className="content">
        <h1>Video Trim</h1>
        <input type="file" accept="video/*" onChange={handleFileChange} />
        {videoFile && (
          <div>
            <video ref={videoRef} src={videoFile} controls width="600" />
          </div>
        )}

        <div>
          <label>Start Time (s):</label>
          <input
            type="number"
            name="start"
            value={startTime}
            onChange={handleTimeChange}
            min="0"
          />
        </div>
        <div>
          <label>End Time (s):</label>
          <input
            type="number"
            name="end"
            value={endTime}
            onChange={handleTimeChange}
            min={startTime}
          />
        </div>

        <button onClick={trimVideo}>✂️ Trim Video</button>
      </div>

      <div className="side-panel">
        {trimmedVideoUrl && (
          <div>
            <h2>Trimmed Video</h2>
            <video src={trimmedVideoUrl} controls width="600" />
            <button onClick={saveTrimmedVideo}>Download Trimmed Video</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
