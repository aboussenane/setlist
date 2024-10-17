"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [search, setSearch] = useState("");
  const [setLists, setSetLists] = useState([]);
  const [buttonClicked, setButtonClicked] = useState(false);

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
      
 
      {/* {setLists && setLists.length > 0 && (
  <div className="p-4 flex flex-col w-full gap-4 items-center border border-gray-300 rounded-lg">
    <h2 className="text-2xl font-bold">Setlists</h2>
    {setLists.map((setList, index) => (
      <div key={index} className="w-full border border-gray-300 rounded-lg p-2">
        
        <p className="text-lg text-center whitespace-pre-wrap">{setList}</p>
      </div>
    ))}
  </div>
)} */}
{setLists && setLists.length > 0 && (
  <div className="p-4 flex flex-col w-full gap-4 items-center border border-gray-300 rounded-lg">
    <h2 className="text-2xl font-bold">Setlists</h2>

    {/* Iterate over the array where each element is [videoID, songInfo[]] */}
    {setLists.map((item, index) => {
      // Check if item is an array and has two elements [videoId, songInfoArray]
      if (Array.isArray(item) && item.length === 2) {
        const [videoId, songInfoArray] = item;
        
        return (
          <div key={index} className="w-full border border-gray-300 rounded-lg p-4">
            {/* Display the videoID */}
            <h3 className="text-xl font-semibold mb-2">Video ID: {videoId}</h3>

            {/* Ensure songInfoArray is an array before mapping */}
            {Array.isArray(songInfoArray) && songInfoArray.length > 0 ? (
              songInfoArray.map((song, songIndex) => (
                <p key={songIndex} className="text-lg text-center whitespace-pre-wrap">
                  <strong>{song.timecode}</strong> - {song.track}
                </p>
              ))
            ) : (
              <p className="text-lg text-center text-gray-500">No song info available</p>
            )}
          </div>
        );
      } else {
        // Handle the case where the item is not in the expected format
        console.error('Unexpected item format:', item);
        return null; // Optionally, return null to skip rendering invalid entries
      }
    })}
  </div>
)}
{/* {buttonClicked && setLists.length === 0 && (
  <div className="p-4 flex flex-col w-full gap-4 items-center border border-gray-300 rounded-lg">
    <h4 className="text-2xl font-bold">Sorry, no results for that query.</h4>
    <p className="text-lg text-center">Hint: try something like &quot;2000&apos;s club dj set&quot;</p>
    
  </div>
)}  */}
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
