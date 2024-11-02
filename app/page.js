"use client";
import YouTubePlayer from "./components/YoutubePlayer";

import { useState } from "react";
//TODO: Add a loading state
//TODO: Cache results
//TODO: Add a refresh button
//TODO: Add login functionality and usage limits
//TODO: Push data to database, retrieve from database
//TODO: Song analysis, ai generation
//TODO: AI database management
export default function Home() {
  const [search, setSearch] = useState("");
  const [prevSearch, setPrevSearch] = useState("");
  const [setLists, setSetLists] = useState([]);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [trackSearch, setTrackSearch] = useState("");
  const [videoId, setVideoId] = useState("");

  const handleSearch = (e) => {
    setSearch(e.target.value); // Update search state with user input
  };

  const handleClick = async () => {
    try {
      console.log('Starting search with query:', search);
      setButtonClicked(true);
      
      if (!search) {
        console.log('Empty search query, returning early');
        return;
      }
      
      setPrevSearch(search);

      // Initial search
      console.log('Attempting initial search...');
      const initialResult = await searchWithKeywords(search);
      
      if (initialResult?.found) {
        console.log('Found results in initial search:', initialResult.result);
        setSetLists(initialResult.result);
        return;
      }

      // If no results, try with "DJ set"
      console.log('No initial results, trying with "DJ set"...');
      const withDjSet = await searchWithKeywords(`${search} DJ set`);
      if (withDjSet?.found) {
        console.log('Found results with DJ set:', withDjSet.result);
        setSetLists(withDjSet.result);
        return;
      }

      // If still no results, try with "mix"
      console.log('No DJ set results, trying with "mix"...');
      const withMix = await searchWithKeywords(`${search} mix`);
      if (withMix?.found) {
        console.log('Found results with mix:', withMix.result);
        setSetLists(withMix.result);
        return;
      }

      // If all searches failed, set empty results
      console.log('No results found across all search attempts');
      setSetLists([]);
      
    } catch (error) {
      console.error('Error in handleClick:', error);
      setSetLists([]); // Reset results on error
      // Could add error state handling here if needed
    }
  };
  const searchWithKeywords = async (searchTerms) => {
    try {
      const response = await fetch(
        `/api/search?keywords=${encodeURIComponent(searchTerms)}`
      );
      const data = await response.json();

      if (!data.success) {
        console.error("API Error:", data.error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching search result:", error);
      return null;
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
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]" role="main">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold text-center">Welcome to Setlist</h1>
        <p className="text-lg">Crowdsource your playlist.</p>

        {/* Search Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleClick();
          }}
          className="w-full flex flex-col gap-4 items-center"
        >
          <label htmlFor="search-input" className="sr-only">
            Search for setlists
          </label>
          <input
            id="search-input"
            className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="Enter a few keywords..."
            value={search}
            onChange={handleSearch}
            aria-label="Search keywords"
            type="search"
          />

          <button
            type="submit"
            className="p-4 text-lg text-black bg-transparent border focus:outline-none hover:ring-2 focus:ring-2 hover:ring-black focus:ring-black border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="Search for setlists"
          >
            Search
          </button>
        </form>

        {/* Results Section */}
        {buttonClicked && (
          <section aria-label="Search Results" className="w-full">
            {setLists && setLists.length > 0 ? (
              <div className="p-4 flex flex-col w-full gap-4 items-center border border-gray-300 rounded-lg">
                <h2 className="text-2xl font-bold">Setlists</h2>
                
                {/* YouTube Video Player */}
                {videoId && (
                  <div className="container mx-auto max-w-3xl mt-8 mb-4" aria-live="polite">
                    <YouTubePlayer videoId={videoId} />
                  </div>
                )}

                {/* Setlists List */}
                <ul className="w-full space-y-4">
                  {setLists.map(({ videoId, tracklists }, index) => (
                    <li
                      key={`${videoId}-${index}`}
                      className="w-full border border-gray-300 rounded-lg p-4"
                    >
                      {Array.isArray(tracklists) && tracklists.length > 0 ? (
                        tracklists.map((tracklist, tracklistIndex) => (
                          <ul
                            key={`${videoId}-${tracklistIndex}`}
                            className="p-2 space-y-2"
                          >
                            {tracklist.map((track, songIndex) => (
                              <li key={`${videoId}-${tracklistIndex}-${songIndex}`}>
                                <button
                                  onClick={() => handleTrackSearch(track.artist, track.songTitle)}
                                  className="w-full text-left"
                                  aria-label={`Play ${track.artist} - ${track.songTitle}`}
                                >
                                  <div className="flex items-center gap-2 w-full border border-gray-300 rounded-lg m-2 hover:bg-gray-50 transition-colors p-4">
                                    <span className="text-lg">
                                      {track.artist} - {track.songTitle}
                                    </span>
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center">
                          No tracks found in this video
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div 
                className="p-4 flex flex-col w-full gap-4 items-center border border-gray-300 rounded-lg"
                role="alert"
              >
                <h2 className="text-2xl font-bold">No tracklists found</h2>
                <p className="text-lg text-center">
                  No results found for &quot;{prevSearch}&quot;. Try searching for something like &quot;2000&apos;s pop club mix&quot; or &quot;festival live set&quot;
                </p>
              </div>
            )}
          </section>
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
