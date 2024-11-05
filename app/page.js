"use client";
import YouTubePlayer from "./components/YoutubePlayer";

import { useState, useCallback } from "react";
//TODO: Add a loading state
//TODO: Cache results
//TODO: Add a refresh button
//TODO: Add login functionality and usage limits
//TODO: Push data to database, retrieve from database
//TODO: Song analysis, ai generation
//TODO: AI database management
const luck = [
  "Afrobeats",
  "Oldschool HipHop",
  "90s Dance Hits",
  "Club DJ Set",
  "R&B Classics"
];
export default function Home() {
  const [search, setSearch] = useState("");
  const [prevSearch, setPrevSearch] = useState("");
  const [setLists, setSetLists] = useState([]);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [trackSearch, setTrackSearch] = useState("");
  const [videoId, setVideoId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleSearch = (e) => {
    setSearch(e.target.value); // Update search state with user input
  };
  const getLucky = async () => {
    try {
      setIsLoading(true);
      const randomIndex = Math.floor(Math.random() * luck.length);
      const randomSearch = luck[randomIndex];
      
      // Update the search input
      setSearch(randomSearch);
      
      await handleClick(randomSearch);
    } catch (error) {
      console.error('Error in getLucky:', error);
    }
    finally {
      setIsLoading(false);
    }
  };
  const handleClick = useCallback(async (searchQuery = search) => {
    try {
      setIsLoading(true);
      console.log('Starting search with query:', searchQuery);
      setButtonClicked(true);
      
      if (!searchQuery) {
        console.log('Empty search query, returning early');
        return;
      }
      
      setPrevSearch(searchQuery);
  
      // Initial search using passed searchQuery instead of state
      console.log('Attempting initial search...');
      const initialResult = await searchWithKeywords(searchQuery);
      
      if (initialResult?.found) {
        console.log('Found results in initial search:', initialResult.result);
        setSetLists(initialResult.result);
        return;
      }
  
      // Rest of your search logic...
    } catch (error) {
      console.error('Error in handleClick:', error);
      setSetLists([]);
    } finally {
      setIsLoading(false);
    }
  }, [search]); // Add search to dependencies
  
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
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-4 sm:p-8 lg:p-20 gap-8 sm:gap-16 font-[family-name:var(--font-geist-sans)]" role="main">
      <main className="flex flex-col gap-6 sm:gap-8 row-start-2 items-center w-full max-w-3xl lg:max-w-5xl px-2 sm:px-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-center">SpinGuru</h1>
        <p className="text-base sm:text-lg">Crowdsource your playlist.</p>

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
            className="w-full p-3 sm:p-4 text-base sm:text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="Enter a few keywords..."
            value={search}
            onChange={handleSearch}
            aria-label="Search keywords"
            type="search"
          />
          <div className="flex gap-4">
            <button
              type="submit"
              className="sm:w-auto px-6 py-3 sm:p-4 text-base sm:text-lg text-black bg-transparent border focus:outline-none hover:ring-2 focus:ring-2 hover:ring-black focus:ring-black border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Search for setlists"
            >
              Search
            </button>
            <button
              type="button" 
              className="sm:w-auto px-6 py-3 sm:p-4 text-base sm:text-lg text-black bg-transparent border focus:outline-none hover:ring-2 focus:ring-2 hover:ring-black focus:ring-black border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="I'm feeling lucky..."
              onClick={getLucky}
            >
              I'm feeling lucky...
            </button>
          </div>

        </form>

        {/* Results Section */}
        {buttonClicked && !isLoading &&(

          <section aria-label="Search Results" className="w-full">
            {setLists && setLists.length > 0 ? (
              <div className="p-3 sm:p-4 flex flex-col w-full gap-4 items-center border border-gray-300 rounded-lg">
                <h2 className="text-xl sm:text-2xl font-bold">Tracks</h2>
                
                {/* YouTube Video Player */}
                {videoId && (
                  <div className="w-full aspect-video max-w-2xl lg:max-w-3xl mt-4 sm:mt-8 mb-2 sm:mb-4" aria-live="polite">
                    <YouTubePlayer videoId={videoId} />
                  </div>
                )}

                {/* Setlists List */}
                <ul className="w-full space-y-3 sm:space-y-4">
                  {setLists.map(({ videoId, tracklists }, index) => (
                    <li
                      key={`${videoId}-${index}`}
                      className="w-full border border-gray-300 rounded-lg p-3 sm:p-4"
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
                                  <div className="flex items-center gap-2 w-full border border-gray-300 rounded-lg m-2 hover:bg-gray-50 transition-colors p-3 sm:p-4">
                                    <span className="text-sm sm:text-base lg:text-lg break-words">
                                      {track.artist} - {track.songTitle}
                                    </span>
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center text-sm sm:text-base">
                          No tracks found in this video
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div 
                className="p-3 sm:p-4 flex flex-col w-full gap-4 items-center border border-gray-300 rounded-lg"
                role="alert"
              >
                <h2 className="text-xl sm:text-2xl font-bold">No tracklists found</h2>
                <p className="text-sm sm:text-base lg:text-lg text-center">
                  No results found for &quot;{prevSearch}&quot;. Try again, it may take a few tries to find what you&quot;re looking for. <br/>
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
