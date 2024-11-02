const RATE_LIMIT_DELAY = 100; // milliseconds between API calls

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { keywords } = req.query;

  if (!keywords) {
    return res.status(400).json({ error: "Missing search keywords" });
  }

  try {
    const scriptResult = await searchYoutube(keywords);
    
    // Check if any tracklists were found
    if (scriptResult.length === 0) {
      return res.status(200).json({ 
        success: true,
        found: false,
        message: "No tracklists found in video comments",
        result: [] 
      });
    }

    return res.status(200).json({ 
      success: true,
      found: true,
      result: scriptResult 
    });
  } catch (error) {
    console.error("Error in handler:", error);
    return res.status(500).json({ 
      success: false,
      error: "Internal Server Error" 
    });
  }
}
async function searchYoutube(keywords) {
  const videoIds = await getVideoIds(keywords);
  console.log(videoIds);
  
  // Process videos sequentially with delay between each
  const comments = [];
  for (const videoId of videoIds) {
    await delay(RATE_LIMIT_DELAY);
    const result = await searchComments(videoId);
    if (result !== null) {
      comments.push(result);
    }
  }

  return comments;
}
// Fetch video IDs from YouTube API based on search keywords
async function getVideoIds(keywords) {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(
    keywords
  )}&key=${API_KEY}`;

  try {
    const response = await fetch(searchUrl);
    if (!response.ok)
      throw new Error(`Failed to fetch videos: ${response.statusText}`);

    const data = await response.json();
    return data.items.map((item) => item.id.videoId);
  } catch (error) {
    console.error("Error fetching video IDs:", error);
    return [];
  }
}

// Search for comments in a YouTube video, extracting setlists if they exist
async function searchComments(videoId) {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  const commentUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=15&key=${API_KEY}`;
  const tracklistsForVideo = [];

  try {
    const response = await fetch(commentUrl);
    if (response.status === 403) {
      console.error("API Key authentication failed or quota exceeded");
      throw new Error("YouTube API authentication failed");
    }
    if (response.status === 304) {
      console.error("Repeated request");
      throw new Error("Repeated request");
    }
    if (!response.ok) {
      console.error(`YouTube API Error: ${response.status} - ${response.statusText}`);
      const errorData = await response.json();
      console.error("Error details:", errorData);
      throw new Error(`Failed to fetch comments: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Use Promise.all to properly wait for all comment processing
    await Promise.all(data.items.map(async (item) => {
      const topComment = item.snippet.topLevelComment.snippet.textDisplay;
      console.log(topComment);
      if (isSetList(topComment)) {
        const tracklist = await extractTracklist(topComment);
        console.log("tracklist", tracklist);
        if (tracklist) {
          tracklistsForVideo.push(tracklist);
        }
      }
    }));

  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error; // Re-throw to handle it in the calling function
  }

  return tracklistsForVideo.length > 0 ?  { videoId, tracklists: tracklistsForVideo } : null;
}
// Function to extract tracklist from a comment and search for each track on YouTube
async function extractTracklist(comment) {
  const trackList = [];
  comment = cleanComment(comment);
  console.log(comment);
  // Regular expression to capture artist and song title
  const regex = /^(.*?)\s*-\s*(.*?)\s*(?:\[\d{4}\])?$/gm; // Global match to capture all lines

  let match;
  while ((match = regex.exec(comment)) !== null) {
    const artist = cleanArtistname(match[1].trim());
    const songTitle = cleanTrackname(match[2].trim());

    

    if (artist && songTitle) {
      trackList.push({ artist, songTitle });
    }
  }

  return trackList.length > 0 ? trackList : null; // Return null if no valid tracklist found
}


// Sanitize the query to avoid issues with special characters
function sanitizeQuery(query) {
  // Log the sanitized query
  const sanitized = query.replace(/[^a-zA-Z0-9\s]/g, '');
  console.log(`Sanitized query: ${sanitized}`);
  return sanitized;
}
// Clean the comment by replacing HTML entities and tags
function cleanComment(comment) {
  const timecodeRegex = /\b\d{1,2}:\d{2}(:\d{2})?\b/g;
  const tracklistRegex = /\btracklist\b/i;
  return comment
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?a[^>]*>/g, "")
    .replace(timecodeRegex, "")
    .replace(tracklistRegex, "")
    .trim();
}
function cleanTrackname(trackname) {
  return trackname.replace(/[^a-zA-Z0-9\s]/g, '');
}
function cleanArtistname(artistname) {
  return artistname.replace(/[^a-zA-Z0-9\s]/g, '');
}
function isSetList(comment) {
  const tracklistRegex = /\btracklist\b/i;
  const tracklistRegex2 = /\btrack list\b/i;
  const timestampslistRegex = /\btimestamps\b/i;
  const validTracklistRegex = /(?:.*\s*[-–]\s*.*<br\s*\/?>){2,}/;

  return (tracklistRegex.test(comment) || tracklistRegex2.test(comment))&& validTracklistRegex.test(comment);
}