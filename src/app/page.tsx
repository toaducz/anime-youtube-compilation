'use client'

import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import ReactPlayer from 'react-player';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';

interface Video {
  playlistTitle: string;
  playlistId: string;
  videoTitle: string;
  embedUrl: string;
}

interface VideoRow {
  "Playlist Title": string;
  "Playlist ID": string;
  "Video Title": string;
  "Embed URL": string;
}

export default function VideosPage() {
  const [data, setData] = useState<Record<string, Video[]>>({});
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [selectedVideoTitle, setSelectedVideoTitle] = useState<string>('');
  const [expandedPlaylists, setExpandedPlaylists] = useState<Record<string, boolean>>({});
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const csvFiles = [
      'musevn.csv',
      // Add more CSV files here, e.g.:
      // 'additional_videos.csv',
      // 'another_playlist.csv',
    ];

    const fetchAndParseCsv = async (file: string) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/data/${file}`);
      const csvText = await response.text();
      const parsed = Papa.parse<VideoRow>(csvText, { header: true });
      return parsed.data;
    };

    const loadAllCsvs = async () => {
      const grouped: Record<string, Video[]> = {};
      
      try {
        const allData = await Promise.all(
          csvFiles.map(file => fetchAndParseCsv(file))
        );

        allData.flat().forEach((row) => {
          if (!row["Playlist ID"] || !row["Embed URL"]) return;

          const video: Video = {
            playlistTitle: row["Playlist Title"],
            playlistId: row["Playlist ID"],
            videoTitle: row["Video Title"],
            embedUrl: row["Embed URL"],
          };

          if (!grouped[video.playlistId]) {
            grouped[video.playlistId] = [];
          }
          grouped[video.playlistId].push(video);
        });

        setData(grouped);
      } catch (error) {
        console.error('Error loading CSV files:', error);
      }
    };

    loadAllCsvs();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const getPlaylistTitleFromVideo = (videoTitle: string) => {
    const titleBeforeDash = videoTitle.split('-')[0].trim();
    return titleBeforeDash.replace(/(tập|episode|ep|phần)\s*\d+/gi, '').trim();
  };

  const handleVideoSelect = (url: string, title: string) => {
    setSelectedUrl(url);
    setSelectedVideoTitle(title);
  };

  const togglePlaylist = (playlistId: string) => {
    setExpandedPlaylists((prev) => ({
      ...prev,
      [playlistId]: !prev[playlistId],
    }));
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col md:flex-row transition-colors duration-300 scale-95">
      {/* Sidebar for Playlists */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-gray-800 shadow-lg p-6 overflow-y-auto max-h-screen relative">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Anime Youtube</h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <SunIcon className="w-6 h-6" />
            ) : (
              <MoonIcon className="w-6 h-6" />
            )}
          </button>
        </div>
        {Object.entries(data).map(([playlistId, videos]) => {
          const firstVideoTitle = videos[0]?.videoTitle || '';
          const playlistTitle = getPlaylistTitleFromVideo(firstVideoTitle) || firstVideoTitle;
          const isExpanded = !!expandedPlaylists[playlistId];

          return (
            <div key={playlistId} className="mb-4">
              <button
                onClick={() => togglePlaylist(playlistId)}
                className="w-full text-left text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 flex justify-between items-center"
              >
                <span className="hover:opacity-70 cursor-pointer">{playlistTitle}</span>
                <span className="text-sm hover:opacity-70 cursor-pointer">{isExpanded ? '▲' : '▼'}</span>
              </button>
              {isExpanded && (
                <ul className="space-y-2 pl-4">
                  {videos.map((video, index) => (
                    <li key={index}>
                      <button
                        onClick={() => handleVideoSelect(video.embedUrl, video.videoTitle)}
                        className={`w-full text-left p-2 rounded-lg transition-colors duration-200 ${
                          selectedUrl === video.embedUrl
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {video.videoTitle}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Video Player Section */}
      <div className="flex-1 p-6 flex flex-col items-center">
        {selectedUrl ? (
          <div className="w-full max-w-4xl">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              {selectedVideoTitle || 'Now Playing'}
            </h3>
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-xl">
              <ReactPlayer
                url={selectedUrl}
                controls
                width="100%"
                height="100%"
                className="absolute top-0 left-0"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-lg text-gray-600 dark:text-gray-400">Chọn video để xem</p>
          </div>
        )}
      </div>
    </div>
  );
}