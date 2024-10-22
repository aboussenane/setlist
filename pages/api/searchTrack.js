export default async function handler(req, res) {
    const { artist, song } = req.query;
  
    // Validate the query parameters
    if (!artist || !song) {
      return res.status(400).json({ error: 'Missing artist or song parameters' });
    }
  
    try {
      // Search YouTube for the track
      const videoId = await searchYoutubeForTrack(artist, song);
  
      // If a video ID was found, return it
      if (videoId) {
        return res.status(200).json({ videoUrl: `https://www.youtube.com/embed/${videoId}` });
      } else {
        // If no video was found, return a message
        return res.status(404).json({ error: `No video found for ${artist} - ${song}` });
      }
    } catch (error) {
      // Handle any errors
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