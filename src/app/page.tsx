/* Hallmark · macrostructure: Catalogue · layout=media-hub, grid=playlists-grid, player=theater
 * theme: custom · vibe: "minimalist editorial document layout, warm bone and charcoal"
 * display: Geist · body: Geist / Instrument Serif · axes: warm / geometric-sans
 * studied: yes · context: explicit · v2.0.0
 */

"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Papa from "papaparse";
import { PlaylistSidebar } from "@/components/playlist-sidebar";
import { VideoPlayer } from "@/components/video-player";
import { ThemeToggle } from "@/components/theme-toggle";
import { BackToTop } from "@/components/back-to-top";

interface Video {
  playlistTitle: string;
  playlistId: string;
  videoTitle: string;
  embedUrl: string;
  channel: string;
}

interface VideoRow {
  "Playlist Title": string;
  "Playlist ID": string;
  "Video Title": string;
  "Embed URL": string;
}

const getChannelName = (filename: string): string => {
  const cleanName = filename.replace(/\.csv$/i, "").toLowerCase();
  if (cleanName === "musevn") return "Muse VN";
  if (cleanName === "anionevietnam") return "Ani-One";
  if (cleanName === "tropicsanimeasia") return "Tropics Anime";
  // Fallback formatting
  return cleanName
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getChannelBadgeStyles = (channel: string): string => {
  const name = channel.toLowerCase();
  if (name.includes("muse")) {
    return "bg-pastel-blue-bg text-pastel-blue-fg border-pastel-blue-fg/10";
  }
  if (name.includes("ani-one") || name.includes("anione")) {
    return "bg-pastel-yellow-bg text-pastel-yellow-fg border-pastel-yellow-fg/10";
  }
  if (name.includes("tropics")) {
    return "bg-pastel-red-bg text-pastel-red-fg border-pastel-red-fg/10";
  }
  return "bg-pastel-green-bg text-pastel-green-fg border-pastel-green-fg/10";
};

export default function VideosPage() {
  const [data, setData] = useState<Record<string, Video[]>>({});
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [selectedVideoTitle, setSelectedVideoTitle] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChannelFilter, setActiveChannelFilter] = useState<string>("All");
  const [, startTransition] = useTransition();

  useEffect(() => {
    const fetchAndParseCsv = async (
      file: string
    ): Promise<(VideoRow & { channel: string })[]> => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/data/${file}`
      );
      const csvText = await response.text();
      const parsed = Papa.parse<VideoRow>(csvText, { header: true });
      const channel = getChannelName(file);
      return parsed.data.map((row) => ({ ...row, channel }));
    };

    const loadAllCsvs = async () => {
      const grouped: Record<string, Video[]> = {};

      try {
        const filesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/files`
        );
        const { files } = await filesResponse.json();
        const csvFiles: string[] = files || [];

        const allData = await Promise.all(
          csvFiles.map((file) => fetchAndParseCsv(file))
        );

        allData.flat().forEach((row) => {
          if (!row["Playlist ID"] || !row["Embed URL"]) return;

          const video: Video = {
            playlistTitle: row["Playlist Title"],
            playlistId: row["Playlist ID"],
            videoTitle: row["Video Title"],
            embedUrl: row["Embed URL"],
            channel: row.channel,
          };

          if (!grouped[video.playlistId]) {
            grouped[video.playlistId] = [];
          }
          grouped[video.playlistId].push(video);
        });

        setData(grouped);

        // Default to select first playlist
        const firstPlaylistId = Object.keys(grouped)[0];
        if (firstPlaylistId) {
          setActivePlaylistId(firstPlaylistId);
        }
      } catch (error) {
        console.error("Error loading CSV files:", error);
      }
    };

    loadAllCsvs();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toTitleCase = (str: string) => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getPlaylistTitleFromVideo = (videoTitle: string) => {
    const titleBeforeDash = videoTitle.split("-")[0].trim();
    return titleBeforeDash.replace(/(tập|episode|ep|phần)\s*\d+/gi, "").trim();
  };

  const getYoutubeId = (url: string | null): string | null => {
    if (!url) return null;
    try {
      if (url.includes("embed/")) {
        return url.split("embed/")[1]?.split("?")[0] || null;
      }
      if (url.includes("v=")) {
        return url.split("v=")[1]?.split("&")[0] || null;
      }
      if (url.includes("youtu.be/")) {
        return url.split("youtu.be/")[1]?.split("?")[0] || null;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const handleVideoSelect = (url: string, title: string) => {
    setSelectedUrl(url);
    setSelectedVideoTitle(toTitleCase(title));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlaylistSelect = (playlistId: string) => {
    setActivePlaylistId(playlistId);
    // Scroll to top so user sees the player and episode list
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleChannelFilterChange = (filter: string) => {
    startTransition(() => {
      setActiveChannelFilter(filter);
    });
  };

  const filteredPlaylists = Object.entries(data).filter(([, videos]) => {
    const firstVideo = videos[0];
    if (!firstVideo) return false;

    // Filter by channel publisher
    if (
      activeChannelFilter !== "All" &&
      firstVideo.channel !== activeChannelFilter
    ) {
      return false;
    }

    const firstVideoTitle = firstVideo.videoTitle || "";
    const playlistTitle =
      getPlaylistTitleFromVideo(firstVideoTitle) || firstVideoTitle;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return playlistTitle.toLowerCase().includes(query);
  });

  const playlistCount = Object.keys(data).length;
  const videoCount = Object.values(data).flat().length;

  const activePlaylistVideos = activePlaylistId
    ? data[activePlaylistId] || []
    : [];
  const activePlaylistFirstVideoTitle =
    activePlaylistVideos[0]?.videoTitle || "";
  const activePlaylistTitle = activePlaylistId
    ? toTitleCase(
        getPlaylistTitleFromVideo(activePlaylistFirstVideoTitle) ||
          activePlaylistFirstVideoTitle
      )
    : null;

  const channels = [
    "All",
    ...Array.from(
      new Set(Object.values(data).flat().map((v) => v.channel))
    ),
  ];

  return (
    <div className="min-h-screen bg-paper text-ink-2 flex flex-col transition-colors duration-150">
      {/* Top Navigation Bar (Document Header) */}
      <nav className="w-full bg-paper border-b border-rule px-4 md:px-8 py-4 flex items-center justify-between z-40 shrink-0 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="p-1 border border-rule rounded">
            <svg
              className="w-3.5 h-3.5 text-ink"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="15" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="18" x2="12" y2="21" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xs font-bold tracking-wider text-ink uppercase leading-none font-mono">
              ANIME CONSOLE
            </h1>
          </div>
        </div>

        {/* Global Dashboard Stats */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-muted uppercase tracking-wider">
              Playlists:
            </span>
            <span className="text-xs font-semibold font-mono text-ink">
              {playlistCount.toString().padStart(2, "0")}
            </span>
          </div>
          <div className="h-4 w-[1px] bg-rule" />
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-muted uppercase tracking-wider">
              Tập Phim:
            </span>
            <span className="text-xs font-semibold font-mono text-ink">
              {videoCount.toString().padStart(3, "0")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-8 md:gap-12 overflow-y-auto">
        {/* Theater Workspace Section (Video Player & Episode Selector Side-by-Side) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2 flex flex-col justify-center">
            <VideoPlayer url={selectedUrl} videoTitle={selectedVideoTitle} />
          </div>
          <div className="flex flex-col">
            <PlaylistSidebar
              activePlaylistTitle={activePlaylistTitle}
              episodes={activePlaylistVideos}
              selectedUrl={selectedUrl}
              onVideoSelect={handleVideoSelect}
            />
          </div>
        </section>

        <hr className="border-rule" />

        {/* Catalogue Section: Grid of Playlists */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <svg
                  className="w-3.5 h-3.5 text-muted"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="2" ry="2" />
                  <line x1="7" y1="2" x2="7" y2="22" />
                  <line x1="17" y1="2" x2="17" y2="22" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                </svg>
                <span className="text-[9px] font-mono text-muted uppercase tracking-widest font-bold">
                  DATABASE DIRECTORY
                </span>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl text-ink tracking-tight italic">
                Danh Sách Playlist Anime
              </h2>
            </div>

            {/* Filter controls and Search bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
              {/* Segmented Channel Filter Buttons */}
              <div className="flex bg-paper-2 border border-rule p-1 rounded text-[10px] font-mono select-none self-start sm:self-auto shrink-0 flex-wrap gap-1">
                {channels.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => handleChannelFilterChange(filter)}
                    className={`px-3 py-1 rounded transition-all duration-150 cursor-pointer ${
                      activeChannelFilter === filter
                        ? "bg-paper text-ink font-bold border border-rule"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    {filter === "All" ? "Tất cả" : filter}
                  </button>
                ))}
              </div>

              {/* Catalogue Search bar */}
              <div className="relative flex items-center w-full sm:max-w-xs">
                <svg
                  className="absolute left-3 w-3.5 h-3.5 text-muted pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Tìm kiếm anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-paper border border-rule rounded-md text-ink placeholder:text-muted/65 focus:outline-none focus:border-ink transition-colors duration-150"
                />
              </div>
            </div>
          </div>

          {/* Anime Grid */}
          {filteredPlaylists.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted font-mono border border-dashed border-rule rounded-lg">
              [ 0 bộ phim phù hợp với bộ lọc ]
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredPlaylists.map(([playlistId, videos]) => {
                const firstVideo = videos[0];
                if (!firstVideo) return null;

                const firstVideoTitle = firstVideo.videoTitle || "";
                const rawTitle =
                  getPlaylistTitleFromVideo(firstVideoTitle) || firstVideoTitle;
                const playlistTitle = toTitleCase(rawTitle);
                const isActive = activePlaylistId === playlistId;
                const videoId = getYoutubeId(firstVideo.embedUrl);

                return (
                  <button
                    key={playlistId}
                    onClick={() => handlePlaylistSelect(playlistId)}
                    className={`group text-left p-4 rounded-lg flex flex-col justify-between gap-4 cursor-pointer flat-card ${
                      isActive ? "flat-card-active" : ""
                    }`}
                  >
                    {/* YouTube Video Art Frame */}
                    <div className="w-full aspect-video rounded bg-paper-3 relative overflow-hidden flex items-center justify-center text-muted/20 border border-rule/65">
                      {videoId ? (
                        <Image
                          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                          alt={playlistTitle}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          priority={false}
                          className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <svg
                          className="w-6 h-6 text-muted/40"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect
                            x="2"
                            y="3"
                            width="20"
                            height="15"
                            rx="2"
                            ry="2"
                          />
                          <line x1="12" y1="18" x2="12" y2="21" />
                        </svg>
                      )}

                      {/* Publisher Channel Badge (Washed-out spot pastel) */}
                      <div
                        className={`absolute top-2 left-2 z-10 px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold tracking-wider uppercase border border-ink/5 ${getChannelBadgeStyles(firstVideo.channel)}`}
                      >
                        {firstVideo.channel}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 min-w-0">
                      <h3
                        className={`text-xs font-semibold line-clamp-2 leading-snug tracking-tight ${
                          isActive
                            ? "text-ink font-bold"
                            : "text-ink-2 hover:text-ink"
                        }`}
                      >
                        {playlistTitle}
                      </h3>

                      <div className="flex items-center justify-between border-t border-rule pt-2">
                        <span className="text-[9.5px] font-mono text-muted uppercase tracking-wider">
                          {videos.length} TẬP
                        </span>

                        {isActive ? (
                          <span className="px-1.5 py-0.5 rounded bg-pastel-green-bg text-[8px] font-mono text-pastel-green-fg uppercase font-bold tracking-wider border border-pastel-green-fg/10">
                            ĐANG XEM
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-muted uppercase tracking-wider group-hover:text-ink transition-colors duration-150">
                            INDEX →
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-paper border-t border-rule px-4 py-6 mt-12 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-muted uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="font-bold text-ink/75">ANIME WATCH INDEX</span>
          </div>
          <span className="text-center md:text-right">
            Bản quyền thuộc về Muse VN & Ani-One Vietnam · Thiết kế bởi
            Minimalist UI
          </span>
        </div>
      </footer>
      <BackToTop />
    </div>
  );
}
