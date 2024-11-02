"use client";
import YouTubePlayer from "./components/YoutubePlayer";

import { useState } from "react";

export default function Home() {
  const [search, setSearch] = useState("");
  const [setLists, setSetLists] = useState([]);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [trackSearch, setTrackSearch] = useState("");
  const [videoId, setVideoId] = useState("");

  const handleSearch = (e) => {
    setSearch(e.target.value); // Update search state with user input
  };

  const handleClick = async () => {
    setButtonClicked(true);
    if (!search) return;

    try {
      const response = await fetch(
        `/api/search?keywords=${encodeURIComponent(search)}`
      );
      const data = await response.json();

      if (!data.success) {
        console.error("API Error:", data.error);
        setSetLists([]);
        return;
      }

      console.log("API Response: ", data);
      setSetLists(data.found ? data.result : []);
    } catch (error) {
      console.error("Error fetching search result:", error);
      setSetLists([]);
    }
  };
  const handleTrackSearch = async (artist, songTitle) => {
    setTrackSearch(`${artist} ${songTitle}`);
    // Fetch the YouTube video from the API
    try {
      const response = await fetch(
        `/api/searchTrack?artist=${encodeURIComponent(
          artist
        )}&song=${encodeURIComponent(songTitle)}`
      );
      const data = await response.json();
      console.log("YouTube API Response: ", data.videoId);
      setVideoId(data.videoId); // Store video URL to display it
    } catch (error) {
      console.error("Error fetching track result:", error);
    }
  };
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold text-center">Welcome to Setlist</h1>
        <p>Crowdsource your playlist.</p>

        {/* Search Input */}
        <input
          className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          placeholder="Enter a few keywords..."
          value={search}
          onChange={handleSearch}
        />

        {/* Search Button */}
        <button
          className="p-4 mx-auto text-lg text-black bg-transparent border focus:outline-none hover:ring-black focus:border-black border-gray-300 rounded-lg m-2 hover:bg-gray-50 transition-colors"
          onClick={handleClick}
        >
          Search
        </button>

        {/* Results Section */}
        {buttonClicked && (
          <>
            {setLists && setLists.length > 0 ? (
              <div className="p-4 flex flex-col w-full gap-4 items-center border border-gray-300 rounded-lg">
                <h2 className="text-2xl font-bold">Setlists</h2>
                {/* YouTube Video Player */}
                {videoId && (
                  <div className="container mx-auto max-w-3xl mt-8 mb-4">
                    <YouTubePlayer videoId={videoId} />
                  </div>
                )}
                {/* Map through each video's setlists */}
                {setLists.map(({ videoId, tracklists }, index) => (
                  <div
                    key={`${videoId}-${index}`}
                    className="w-full border border-gray-300 rounded-lg p-4"
                  >
                    {/* <h3 className="text-xl font-semibold mb-2">
                      Video ID: {videoId}
                    </h3> */}

                    {Array.isArray(tracklists) && tracklists.length > 0 ? (
                      tracklists.map((tracklist, tracklistIndex) => (
                        <div
                          key={`${videoId}-${tracklistIndex}`}
                          className="p-2"
                        >
                          {tracklist.map((track, songIndex) => (
                            <button
                              key={`${videoId}-${tracklistIndex}-${songIndex}`}
                              onClick={() =>
                                handleTrackSearch(track.artist, track.songTitle)
                              }
                              className="w-full"
                            >
                              <div className="flex items-center gap-2 w-full border border-gray-300 rounded-lg m-2 hover:bg-gray-50 transition-colors">
                                <p className="text-lg text-center whitespace-pre-wrap m-2">
                                  {track.artist} - {track.songTitle}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center">
                        No tracks found in this video
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 flex flex-col w-full gap-4 items-center border border-gray-300 rounded-lg">
                <h4 className="text-2xl font-bold">No tracklists found</h4>
                <p className="text-lg text-center">
                  Try searching for something like &quot;2000&apos;s club dj
                  set&quot; or &quot;festival live set&quot;
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
{
  /* <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
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
      </footer> */
}
