

export default async function handler(req, res) {
    if (req.method === 'GET') {
      const { keywords } = req.query; // Extract keywords from query parameters
  
      if (!keywords) {
        return res.status(400).json({ error: 'Missing search keywords' });
      }
  
      // Run your script based on the keywords
      // For this example, we will simply return the keywords.
      // You can run any backend logic you need here.
      
      const scriptResult = await searchYoutube(keywords);
  
      // Send the result back
      return res.status(200).json({ result: scriptResult });
    } else {
      // Only allow GET requests
      return res.status(405).json({ error: 'Method not allowed' });
    }
  }
  
  
  
async function searchYoutube(keywords) {
    const videoIds = await getVideoIds(keywords);
    const commentsWithTimestamps = [];
  
    for (const videoId of videoIds) {
      const matchingComments = await searchComments(videoId); // Get comments with timestamps
      commentsWithTimestamps.push(...matchingComments); // Push all matching comments into the array
    }
  
    return commentsWithTimestamps; // Return all the comments that contain timestamps
  }
  
  async function getVideoIds(keywords) {
    const videoIds = [];
    const API_KEY = process.env.YOUTUBE_API_KEY;
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(keywords)}&key=${API_KEY}`;
  
    try {
      const response = await fetch(searchUrl);
      if (!response.ok) {
        console.error('Failed to fetch videos:', response.status, response.statusText);
        return videoIds;
      }
  
      const data = await response.json();
      data.items.forEach((item) => {
        videoIds.push(item.id.videoId);
      });
    } catch (error) {
      console.error('Error fetching video IDs:', error);
    }
  
    return videoIds;
  }
  
  async function searchComments(videoId) {
    const setLists = [];
    
    // Access the YouTube API key from the environment variable
    const API_KEY = process.env.YOUTUBE_API_KEY;
    
    // YouTube commentThreads API endpoint for getting comments on a video
    const commentUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&key=${API_KEY}`;
  
    try {
      let nextPageToken = '';
      let fetchUrl = commentUrl;
  
      do {
        const response = await fetch(fetchUrl);
  
        if (!response.ok) {
          console.error('Failed to fetch comments:', response.status, response.statusText);
          return setLists;  // Return empty if failed
        }
  
        const data = await response.json();
        
        // Extract the top-level comments and push them into the comments array
        data.items.forEach((item) => {
          const topComment = item.snippet.topLevelComment.snippet.textDisplay;
          //comments.push(topComment);
          
          if (isSetList(topComment)) {
            //setLists.push(getSetList(topComment)); //later to treat the comment and extract set list
            setLists.push(extractTracklist(topComment));
            
          }
        });
  
        // If there's a next page, update fetchUrl to fetch more comments
        nextPageToken = data.nextPageToken || null;
        if (nextPageToken) {
          fetchUrl = `${commentUrl}&pageToken=${nextPageToken}`;
        }
      } while (nextPageToken);  // Keep fetching while there's a nextPageToken
      
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  
    return setLists;
  }
  function getSetList(comment) {
    const setList = [];
  
    // Regular expression to match any timecode (MM:SS or H:MM:SS)
    const timecodeRegex = /\b\d{1,2}:\d{2}(:\d{2})?\b/g;
  
    let match;
    while ((match = timecodeRegex.exec(comment)) !== null) {
      // Get the timecode (match[0] will be the matched timecode)
      const timecode = match[0];
      
      // Extract the track name by slicing the comment after the timecode
      const trackStartIndex = match.index + match[0].length;
      const trackText = comment.slice(trackStartIndex).split('\n')[0].trim(); // Get the text following the timecode
      
      // Push the result into the setList array
      setList.push({ timecode, track: trackText });
    }
  
    // Return the extracted setlist
    return setList;
  }
  function extractTracklist(comment) {
    const trackList = [];
  //clean the comment
    // Regex to match timecode and track info
    //const regex = /(?:<br\s*\/?>){5,}\s*<a href=".*?t=\d+">.*?<\/a>\s*(?:–\s*)?(.*?)(?=<br>|$)/g;
    //const regex = /(?:<br\s*\/?>){5,}/g;
    
      //let match;
      //while ((match = regex.exec(comment)) !== null) {
        //const trackInfo = match[1].trim(); // Clean the track info
        trackList.push(cleanComment(comment)); // Add track info to the list
     //}
    
      return trackList;
  }
function isSetList(comment) {
    // Regular expression to match timecode followed by a track name
    const setListRegex = /(?:<br\s*\/?>){5,}/g;
    const timecodeRegex = /\b\d{1,2}:\d{2}(:\d{2})?\b/g;
    const lineBreakRegex = /(?:.*?\n){7,}/g;
    const tracklistRegex = /\btracklist\b/i; // Detect the word "tracklist"
    const validTracklistRegex = /(?:.*\s*[-–]\s*.*<br\s*\/?>){2,}/; // At least 2 lines with "track - artist" format
  
    // First, check if the comment contains the word "tracklist"
    if (tracklistRegex.test(comment)) {
      // Then check if the comment contains at least 2 lines following the "track - artist" pattern
      return validTracklistRegex.test(comment);
    }
  
    return false; // Return false if it doesn't meet the criteria
  }
function cleanComment(comment) {
    // Replace HTML entities with their corresponding characters
    return comment
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, '&')
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/<br\s*\/?>/gi, '\n') // Replace <br> with newlines for easier reading
      .replace(/<\/?a[^>]*>/g, ''); // Remove all <a> tags
  }