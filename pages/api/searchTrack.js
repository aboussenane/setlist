// import LRU from 'lru-cache';

// // Configure the rate limiter
// const rateLimitOptions = {
//   max: 100, // Maximum number of requests
//   ttl: 60 * 1000, // Time-to-live (in milliseconds) - 1 minute
// };
// const rateLimiter = new LRU(rateLimitOptions);

export default async function handler(req, res) {
  const { artist, song } = req.query;

  // // Check if the client IP is rate limited
  // const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  // const requestCount = rateLimiter.get(clientIp) || 0;

  // if (requestCount >= rateLimitOptions.max) {
  //   return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  // }

  // // Increment the request count
  // rateLimiter.set(clientIp, requestCount + 1);


  if (!artist || !song) {
    return res.status(400).json({ error: 'Missing artist or song parameters' });
  }

  try {
    const videoId = await searchYoutubeForTrack(artist, song);

    if (videoId) {
      return res.status(200).json({ videoId });
    } else {
      return res.status(404).json({ error: `No video found for ${artist} - ${song}` });
    }
  } catch (error) {
    console.error('Error in searchTrack API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

  export async function searchYoutubeForTrack(artist, songTitle) {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    
    // Combine artist and song title for the query
    const query = `${sanitizeQuery(artist)} ${sanitizeQuery(songTitle)}`;
    
    // Log the query to check its correctness
    console.log(`Searching YouTube for: ${query}`);
    
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(query)}&key=${API_KEY}`;
  
    try {
      const response = await fetch(searchUrl);
      
      // Log the response status
      console.log(`YouTube API response status: ${response.status}`);
  
      if (!response.ok) {
        throw new Error(`Failed to fetch video for track: ${artist} - ${songTitle}`);
      }
  
      const data = await response.json();
      
      // Log the raw YouTube API response
      console.log(`YouTube API response data: ${JSON.stringify(data, null, 2)}`);
  
      if (data.items && data.items.length > 0) {
        // Log the video ID being returned
        console.log(`Video ID found for ${artist} - ${songTitle}: ${data.items[0].id.videoId}`);
        return data.items[0].id.videoId; // Return the first videoId found
      } else {
        console.error(`No videos found for track: ${artist} - ${songTitle}`);
        return null;
      }
    } catch (error) {
      console.error(`Error searching for track on YouTube: ${error.message}`);
      return null;
    }
  }
  
  // Function to sanitize the query
  function sanitizeQuery(query) {
    return query.replace(/[^\w\s]/gi, ''); // Remove special characters
  }