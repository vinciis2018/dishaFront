
/**
 * Gets the duration of a video file in seconds
 * @param file The video file to get duration from
 * @returns A promise that resolves with the duration in seconds
 */
export const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    // Create a temporary URL for the video file
    const videoUrl = URL.createObjectURL(file);
    
    // Create a video element
    const video = document.createElement('video');
    
    // Set up event handlers
    video.onloadedmetadata = () => {
      // Revoke the object URL to free up memory
      URL.revokeObjectURL(video.src);
      
      // Return the duration in seconds
      resolve(video.duration);
    };
    
    video.onerror = () => {
      // Revoke the object URL on error
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video metadata'));
    };
    
    // Set the video source to the temporary URL
    video.src = videoUrl;
    
    // For some browsers, we need to load the video first
    video.load();
  });
};

/**
 * Formats duration in seconds to a human-readable string (HH:MM:SS)
 * @param seconds Duration in seconds
 * @returns Formatted time string (e.g., "01:23:45" or "12:34")
 */
export const formatDuration = (seconds: number) => {
  // const seconds = await getVideoDuration(file);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
};
