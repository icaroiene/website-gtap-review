"use client";

import { useEffect, useRef, useState } from "react";
import "./Banner.css";
import ResponsiveImage from '../ResponsiveImage/ResponsiveImage';

const POSTER_URL = "/preloadBanner.webp";

export const BannerSection = ({ data, poster }) => {
  const videoBackground = data.find((video) => video.type === 6);
  const videoUrl = videoBackground?.mediaUrl;
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  useEffect(() => {
    if (!videoUrl) return undefined;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const canPlayAutomatically = () => !motionPreference.matches && !connection?.saveData;

    if (!canPlayAutomatically()) return undefined;

    let cancelled = false;
    let idleId;
    let timeoutId;
    const scheduleVideo = () => {
      const startLoading = () => {
        if (!cancelled) setVideoReady(true);
      };

      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(startLoading, { timeout: 3000 });
      } else {
        timeoutId = window.setTimeout(startLoading, 250);
      }
    };

    if (document.readyState === "complete") scheduleVideo();
    else window.addEventListener("load", scheduleVideo, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", scheduleVideo);
      if (idleId !== undefined && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoReady) return undefined;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || (motionPreference.matches || connection?.saveData)) {
        video.pause();
        return;
      }

      video.play().catch(() => {});
    }, { threshold: 0.1 });

    const retryPlayback = () => {
      if (!motionPreference.matches && !connection?.saveData && video.paused && video.getBoundingClientRect().bottom > 0 && video.getBoundingClientRect().top < window.innerHeight) {
        video.play().catch(() => { /* Browser may still block autoplay; keep the poster. */ });
      }
    };
    const stopForReducedMotion = () => {
      if (motionPreference.matches) video.pause();
    };
    observer.observe(video);
    document.addEventListener("pointerdown", retryPlayback);
    document.addEventListener("keydown", retryPlayback);
    motionPreference.addEventListener?.("change", stopForReducedMotion);
    return () => {
      observer.disconnect();
      document.removeEventListener("pointerdown", retryPlayback);
      document.removeEventListener("keydown", retryPlayback);
      motionPreference.removeEventListener?.("change", stopForReducedMotion);
      video.pause();
    };
  }, [videoReady]);

  return (
    <section className="banner-container" id="inicio">
      <ResponsiveImage
        image={poster}
        className={`banner-poster${videoPlaying ? " is-hidden" : ""}`}
        src={POSTER_URL}
        sizes="100vw"
        width="1920"
        height="1170"
        alt=""
        fetchPriority="high"
        loading="eager"
        decoding="async"
      />
      {videoReady && videoUrl && (
        <video
          ref={videoRef}
          className="video-background"
          src={videoUrl}
          preload="none"
          muted
          loop
          playsInline
          aria-hidden="true"
          onPlaying={() => setVideoPlaying(true)}
          onPause={() => setVideoPlaying(false)}
        />
      )}
    </section>
  );
};
