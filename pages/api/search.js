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
    return res.status(200).json({ result: scriptResult });
  } catch (error) {
    console.error("Error in handler:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
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
// Fetch comments from YouTube for each video and extract tracklists
async function searchYoutube(keywords) {
  const videoIds = await getVideoIds(keywords);

  // Use Promise.all to fetch comments for all video IDs in parallel
  const comments = (await Promise.all(videoIds.map(searchComments))).filter(
    (item) => item !== null
  ); // Filter out null results

  return comments;
}
// Search for comments in a YouTube video, extracting setlists if they exist
async function searchComments(videoId) {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  const commentUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=25&key=${API_KEY}`;
  const tracklistsForVideo = [];

  try {
    let nextPageToken = "";
    let fetchUrl = commentUrl;

    
      const response = await fetch(fetchUrl);
      if (!response.ok)
        throw new Error(`Failed to fetch comments: ${response.statusText}`);

      const data = await response.json();

      data.items.forEach(async (item) => {
        const topComment = item.snippet.topLevelComment.snippet.textDisplay;

        if (isSetList(topComment)) {
          const tracklist = await extractTracklist(topComment); // Await YouTube search for each track

          if (tracklist) {
            tracklistsForVideo.push(tracklist);
          }
        }
      });

      
  } catch (error) {
    console.error("Error fetching comments:", error);
  }

  return tracklistsForVideo.length > 0 ? [videoId, tracklistsForVideo] : null;
}
// Function to extract tracklist from a comment and search for each track on YouTube
async function extractTracklist(comment) {
  const trackList = [];
  comment = cleanComment(comment);

  // Regular expression to capture artist and song title
  const regex = /^(.*?)\s*-\s*(.*?)\s*(?:\[\d{4}\])?$/gm; // Global match to capture all lines

  let match;
  while ((match = regex.exec(comment)) !== null) {
    const artist = match[1].trim();
    const songTitle = match[2].trim();

    

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
function isSetList(comment) {
  const tracklistRegex = /\btracklist\b/i;
  const validTracklistRegex = /(?:.*\s*[-–]\s*.*<br\s*\/?>){2,}/;

  return tracklistRegex.test(comment) && validTracklistRegex.test(comment);
}