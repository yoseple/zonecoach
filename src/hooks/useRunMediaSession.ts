import { useEffect } from 'react';

interface MediaMetadata {
  title: string;
  artist: string;
  album: string;
  artwork?: { src: string; sizes: string; type: string }[];
}

interface Handlers {
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
}

export const useRunMediaSession = (isActive: boolean, metadata: MediaMetadata, handlers: Handlers) => {
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    if (isActive) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: metadata.title,
        artist: metadata.artist,
        album: metadata.album,
        artwork: metadata.artwork || [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      });

      // Set playback state to 'playing' when tracking
      navigator.mediaSession.playbackState = 'playing';

      if (handlers.onPlay) navigator.mediaSession.setActionHandler('play', handlers.onPlay);
      if (handlers.onPause) navigator.mediaSession.setActionHandler('pause', handlers.onPause);
      if (handlers.onStop) navigator.mediaSession.setActionHandler('stop', handlers.onStop);
    } else {
      navigator.mediaSession.playbackState = 'paused';
    }

    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('stop', null);
      }
    };
  }, [isActive, metadata, handlers]);
};
