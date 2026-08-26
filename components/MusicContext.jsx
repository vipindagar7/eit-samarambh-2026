"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import config from "@/lib/config";

// Build playlist by pairing songs with their expected audio files + clip window.
// Missing files are skipped automatically - drop mp3s into public/audio/
export const playlist = config.artist.songs
  .map((title, i) => {
    const file = config.artist.audioFiles?.[i];
    if (!file) return null;
    const url = `/audio/${file}`;
    const clip = config.artist.audioClips?.[i] || { start: 0, end: null };
    return { title, url, start: clip.start || 0, end: clip.end };
  })
  .filter(Boolean);

const MusicContext = createContext(null);

export function useMusic() {
  return useContext(MusicContext);
}

export function MusicProvider({ children }) {
  const audioRef = useRef(null);
  const skipAttemptsRef = useRef(0);

  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stuck, setStuck] = useState(false);
  const [visible, setVisible] = useState(false);

  const current = playlist[trackIndex];

  // let other sections (like the DJ waveform) know playback state
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("samarambh:playing-state", { detail: playing }));
  }, [playing]);

  // player sticks to the bottom once the user scrolls past the artist section
  useEffect(() => {
    const stick = () => setStuck(true);
    const unstick = () => setStuck(false);
    window.addEventListener("samarambh:stick-player", stick);
    window.addEventListener("samarambh:unstick-player", unstick);
    return () => {
      window.removeEventListener("samarambh:stick-player", stick);
      window.removeEventListener("samarambh:unstick-player", unstick);
    };
  }, []);

  // check each track file actually exists before treating player as ready
  useEffect(() => {
    if (!current) return;
    setReady(false);
    const test = new Audio();
    let settled = false;
    test.oncanplaythrough = () => {
      settled = true;
      skipAttemptsRef.current = 0;
      setReady(true);
    };
    test.onerror = () => {
      settled = true;
      setReady(false);
      console.warn(`[music player] couldn't load "${current.url}" — check the file exists at that path with that exact name, and isn't a 0-byte/corrupt file.`);
      autoSkipBroken();
    };
    test.src = current.url;
    // some browsers don't fire onerror for a 404 or a 0-byte file — this catches that case
    const timeout = setTimeout(() => {
      if (!settled) {
        setReady(false);
        console.warn(`[music player] timed out loading "${current.url}" — check the file exists at that path with that exact name, and isn't a 0-byte/corrupt file.`);
        autoSkipBroken();
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, [current]);

  // don't get stuck forever on one broken file — try the next track, up to
  // once around the whole playlist
  const autoSkipBroken = () => {
    skipAttemptsRef.current += 1;
    if (skipAttemptsRef.current < playlist.length) {
      setTrackIndex((i) => (i + 1) % playlist.length);
    }
  };

  // seek to clip start once the file is ready
  useEffect(() => {
    if (!ready || !audioRef.current || !current) return;
    audioRef.current.currentTime = current.start;
  }, [ready, current]);

  // start playback only once the artist section has been scrolled into view.
  // If the file isn't "ready" yet at that exact moment (readiness check still
  // in flight), remember the request and retry once it becomes ready instead
  // of silently giving up — this was why autoplay worked inconsistently while
  // manual clicking (which naturally happens after the file has loaded) did.
  const pendingAutoplayRef = useRef(false);

  const attemptAutoplay = () => {
    setVisible(true);
    // give the <audio> element a moment to actually pick up the current
    // src from the last render before calling play() — calling it in the
    // same tick as a track change (e.g. right after auto-skipping a broken
    // file) can hit the element before its src has updated, which throws a
    // real error that isn't actually the browser blocking autoplay.
    requestAnimationFrame(() => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.muted = true;
      audio
        .play()
        .then(() => {
          audio.muted = false;
          setPlaying(true);
          pendingAutoplayRef.current = false;
        })
        .catch((err) => {
          console.warn("[music player] autoplay didn't start:", err?.name, err?.message);
          setBlocked(true);
          setPlaying(false);
          pendingAutoplayRef.current = false;
        });
    });
  };

  useEffect(() => {
    const startPlayback = () => {
      if (ready) {
        attemptAutoplay();
      } else {
        pendingAutoplayRef.current = true;
        setVisible(true);
      }
    };
    window.addEventListener("samarambh:play-teaser", startPlayback);
    return () => window.removeEventListener("samarambh:play-teaser", startPlayback);
  }, [ready]);

  // retry the moment the file actually becomes ready
  useEffect(() => {
    if (ready && pendingAutoplayRef.current) {
      attemptAutoplay();
    }
  }, [ready]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setVisible(true);
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    if (!ready) {
      // the current track isn't actually loadable — try the next one
      // instead of calling play() on a broken source (that throws
      // NotSupportedError and crashes the click handler)
      console.warn(`[music player] "${current?.title}" isn't ready yet — skipping to the next track.`);
      autoSkipBroken();
      return;
    }

    audio.muted = false;
    if (current && audio.currentTime < current.start) {
      audio.currentTime = current.start;
    }
    audio
      .play()
      .then(() => {
        setPlaying(true);
        setBlocked(false);
      })
      .catch((err) => {
        console.warn("[music player] play() failed:", err?.name, err?.message);
        setBlocked(true);
        setPlaying(false);
      });
  };

  const playTrack = (index) => {
    setTrackIndex(index);
    setProgress(0);
    setVisible(true);
    // audio src updates via the <audio> element re-rendering with the new
    // current.url; give it a tick before playing
    setTimeout(() => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.muted = false;
      audio.play().then(() => setPlaying(true)).catch((err) => {
        console.warn("[music player] play() failed:", err?.name, err?.message);
        setBlocked(true);
      });
    }, 60);
  };

  const nextTrack = () => {
    setTrackIndex((i) => (i + 1) % playlist.length);
    setProgress(0);
  };

  const prevTrack = () => {
    setTrackIndex((i) => (i - 1 + playlist.length) % playlist.length);
    setProgress(0);
  };

  // stop each clip at its configured end time, then auto-advance
  const onTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !current) return;

    const clipEnd = current.end ?? audio.duration;
    const clipStart = current.start;
    const clipLength = clipEnd - clipStart;

    if (clipLength > 0) {
      setProgress(((audio.currentTime - clipStart) / clipLength) * 100);
    }

    if (current.end && audio.currentTime >= current.end) {
      nextTrack();
    }
  };

  const value = {
    playlist,
    trackIndex,
    current,
    playing,
    blocked,
    progress,
    stuck,
    visible,
    togglePlay,
    playTrack,
    nextTrack,
    prevTrack,
  };

  return (
    <MusicContext.Provider value={value}>
      <audio ref={audioRef} src={current?.url} onEnded={nextTrack} onTimeUpdate={onTimeUpdate} />
      {children}
    </MusicContext.Provider>
  );
}