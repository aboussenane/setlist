

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { keywords } = req.query;

  if (!keywords) {
    return res.status(400).json({ error: 'Missing search keywords' });
  }

  try {
    const scriptResult = await searchYoutube(keywords);
    return res.status(200).json({ result: scriptResult });
  } catch (error) {
    console.error('Error in handler:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Fetch video IDs from YouTube API based on search keywords
async function getVideoIds(keywords) {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(keywords)}&key=${API_KEY}`;
  
  try {
    const response = await fetch(searchUrl);
    if (!response.ok) throw new Error(`Failed to fetch videos: ${response.statusText}`);
    
    const data = await response.json();
    return data.items.map(item => item.id.videoId);
  } catch (error) {
    console.error('Error fetching video IDs:', error);
    return [];
  }
}
// Fetch comments from YouTube for each video and extract tracklists
async function searchYoutube(keywords) {
  const videoIds = await getVideoIds(keywords);
  
  // Use Promise.all to fetch comments for all video IDs in parallel
  const comments = (await Promise.all(videoIds.map(searchComments))).flat();

  return comments;
}
  // Search for comments in a YouTube video, extracting setlists if they exist
async function searchComments(videoId) {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  const commentUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&key=${API_KEY}`;
  const setLists = [];

  try {
    let nextPageToken = '';
    let fetchUrl = commentUrl;

    do {
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error(`Failed to fetch comments: ${response.statusText}`);

      const data = await response.json();
      data.items.forEach(item => {
        const topComment = item.snippet.topLevelComment.snippet.textDisplay;
        if (isSetList(topComment)) {
          //setLists.push(getSetList(topComment)); //later to treat the comment and extract set list
          setLists.push(videoId, extractTracklist(topComment));
          
        }
      });

      nextPageToken = data.nextPageToken || null;
      if (nextPageToken) {
        fetchUrl = `${commentUrl}&pageToken=${nextPageToken}`;
      }
    } while (nextPageToken);

  } catch (error) {
    console.error('Error fetching comments:', error);
  }

  return setLists;
}
 
  function extractTracklist(comment) {
    const trackList = [];
    comment = cleanComment(comment);
    const regex = /^(.*?)\s*-\s*(.*?)\s*(?:\[\d{4}\])?$/;
     // Execute the regex to match the artist and song title
    const match = comment.match(regex);    
    
     // If a match is found, return the artist and song title, otherwise return null
    if (match) {
      const artist = match[1].trim();
      const songTitle = match[2].trim();
      return { artist, songTitle };
    } else {
      return null; // If the format doesn't match
    }
  }
  // function extractTracklist(comment) {
  //   const setList = [];
  //   const timecodeRegex = /\b\d{1,2}:\d{2}(:\d{2})?\b/g;
  
  //   let match;
  //   while ((match = timecodeRegex.exec(comment)) !== null) {
  //     const timecode = match[0];
  //     const trackStartIndex = match.index + match[0].length;
  //     const trackText = comment.slice(trackStartIndex).split('\n')[0].trim();
  //     setList.push({ timecode, track: trackText });
  //   }
  
  //   return setList;
  // }
  // Check if a comment contains a valid setlist
function isSetList(comment) {
  const tracklistRegex = /\btracklist\b/i;
  const validTracklistRegex = /(?:.*\s*[-–]\s*.*<br\s*\/?>){2,}/;
  
  return tracklistRegex.test(comment) && validTracklistRegex.test(comment);
}
// Clean the comment by replacing HTML entities and tags
function cleanComment(comment) {
  const timecodeRegex = /\b\d{1,2}:\d{2}(:\d{2})?\b/g;
  const tracklistRegex = /\btracklist\b/i;
  return comment
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?a[^>]*>/g, '')
    .replace(timecodeRegex, '')
    .replace(tracklistRegex, '')
    .trim();
}