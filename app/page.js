"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [search, setSearch] = useState("");
  const [setLists, setSetLists] = useState([]);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [trackSearch, setTrackSearch] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  
  const handleSearch = (e) => {
    setSearch(e.target.value); // Update search state with user input
  };

  const handleClick = async () => {
    setButtonClicked(true);
    if (!search) return;

    // Fetch the search result from the API
    try {
      const response = await fetch(`/api/search?keywords=${encodeURIComponent(search)}`);
      const data = await response.json();
      console.log("API Response: ", data.result);
      setSetLists(data.result);
    } catch (error) {
      console.error("Error fetching search result:", error);
    }
  };
  const handleTrackSearch = async (artist, songTitle) => {
    setTrackSearch(`${artist} ${songTitle}`);
    // Fetch the YouTube video from the API
    try {
      const response = await fetch(`/api/searchTrack?artist=${encodeURIComponent(artist)}&song=${encodeURIComponent(songTitle)}`);
      const data = await response.json();
      console.log("YouTube API Response: ", data.videoUrl);
      setVideoUrl(data.videoUrl); // Store video URL to display it
    } catch (error) {
      console.error("Error fetching track result:", error);
    }
  };
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
      <h1 className="text-4xl font-bold text-center">Welcome to Setlist</h1>
      <p>Crowdsource your playlist.</p>
      <input className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent" placeholder="Enter a few keywords..." 
         value={search}
         onChange={handleSearch}
      />
      <button className="p-4 text-lg text-black bg-transparent rounded-lg border border-gray-300 focus:outline-none hover:ring-black focus:border-black"
      onClick={handleClick}
      >Search</button>
      
 

      {setLists && setLists.length > 0 && (
  <div className="p-4 flex flex-col w-full gap-4 items-center border border-gray-300 rounded-lg">
    <h2 className="text-2xl font-bold">Setlists</h2>

    {/* Iterate over each [videoID, tracklist[]] pair */}
    {setLists.map(([videoId, tracklists], index) => (
      <div key={index} className="w-full border border-gray-300 rounded-lg p-4">
        {/* Display the videoID */}
        <h3 className="text-xl font-semibold mb-2">Original Video ID: {videoId}</h3>

        {/* Ensure tracklists is an array before mapping */}
        {Array.isArray(tracklists) && tracklists.length > 0 ? (
          tracklists.map((tracklist, tracklistIndex) => (
            <div key={tracklistIndex} className="p-2">
              {/* Iterate over each track in the tracklist */}
              {tracklist.map((track, songIndex) => (
                <button key={songIndex} onClick={() => handleTrackSearch(track.artist, track.songTitle)}> 

               
                <div className="flex items-center gap-2 w-full border border-gray-300 rounded-lg m-2 ">
                <p  onChange={handleTrackSearch} className=" text-lg text-center whitespace-pre-wrap m-2 ">
                  {/* Display the video ID, artist, and song title */}
                  {track.artist} - {track.songTitle}
                </p>
                </div>
                </button >
              ))}
            </div>
          ))
        ) : (
          <p className="text-lg text-center text-gray-500">No song info available</p>
        )}
      </div>
    ))}
  </div>
)}


{/* {buttonClicked && setLists.length === 0 && (
  <div className="p-4 flex flex-col w-full gap-4 items-center border border-gray-300 rounded-lg">
    <h4 className="text-2xl font-bold">Sorry, no results for that query.</h4>
    <p className="text-lg text-center">Hint: try something like &quot;2000&apos;s club dj set&quot;</p>
    
  </div>
)}  */}
{videoUrl && (
          <div className="w-full mt-8">
            <iframe
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${videoUrl}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerpolicy="strict-origin-when-cross-origin" 
              allowFullScreen
            ></iframe>
          </div>
        )}
      </main>
      {/* <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer> */}
    </div>
  );
}
