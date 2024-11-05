"use client";

import React from 'react';
import YouTube from 'react-youtube';

const YouTubePlayer = ({ videoId }) => {
  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  const onReady = (event) => {
    // Access to player in all event handlers via event.target
    event.target.pauseVideo();
  };

  return (
    <div className="relative w-full h-0 pb-[56.25%]"> {/* 16:9 Aspect Ratio */}
      <div className="absolute top-0 left-0 w-full h-full">
        <YouTube 
          videoId={videoId} 
          opts={opts} 
          onReady={onReady}
          className="w-full h-full"
          iframeClassName="w-full h-full"
        />
      </div>
    </div>
  );
};

export default YouTubePlayer;