"use client";

import { useState } from "react";

interface Video {
  playlistTitle: string;
  playlistId: string;
  videoTitle: string;
  embedUrl: string;
}

interface PlaylistSidebarProps {
  activePlaylistTitle: string | null;
  episodes: Video[];
  selectedUrl: string | null;
  onVideoSelect: (url: string, title: string) => void;
}

export const PlaylistSidebar = ({
  activePlaylistTitle,
  episodes,
  selectedUrl,
  onVideoSelect,
}: PlaylistSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEpisodes = episodes.filter((video) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return video.videoTitle.toLowerCase().includes(query);
  });

  return (
    <aside className="w-full lg:w-96 bg-paper-2 border border-rule rounded-lg flex flex-col h-[400px] lg:max-h-[calc(100vh-10rem)] overflow-hidden shrink-0 shadow-none">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-rule flex flex-col gap-2 shrink-0 bg-paper-2">
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18" />
          </svg>
          <span className="uppercase text-[9px] tracking-[0.15em] font-mono text-muted font-bold">
            EPISODE INDEX
          </span>
        </div>
        <h3 className="text-sm font-semibold text-ink truncate text-wrap line-clamp-2 leading-snug">
          {activePlaylistTitle || "Chưa Chọn Anime"}
        </h3>
      </div>

      {activePlaylistTitle ? (
        <>
          {/* Episode Search */}
          <div className="px-4 py-3 border-b border-rule shrink-0 bg-paper-2/50">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Tìm tập phim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-paper border border-rule rounded-md text-ink placeholder:text-muted/65 focus:outline-none focus:border-ink transition-colors duration-150"
              />
            </div>
          </div>

          {/* Episode List */}
          <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar bg-paper-2/20">
            {filteredEpisodes.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted font-mono">
                [ 0 tập phim tìm thấy ]
              </div>
            ) : (
              filteredEpisodes.map((video, index) => {
                const isActive = selectedUrl === video.embedUrl;
                // Try to extract clean episode title or use full title
                const cleanEpTitle = video.videoTitle
                  .replace(video.playlistTitle, "")
                  .replace(/^-/, "")
                  .trim();
                const displayTitle = cleanEpTitle || video.videoTitle;

                return (
                  <button
                    key={index}
                    onClick={() => onVideoSelect(video.embedUrl, video.videoTitle)}
                    className={`w-full text-left px-3 py-2 text-xs rounded transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 ${
                      isActive
                        ? "bg-paper-3 text-ink font-semibold border-l-2 border-ink pl-2"
                        : "bg-transparent text-ink-2 hover:bg-paper-3/40 hover:text-ink border-l-2 border-transparent"
                    }`}
                  >
                    <span className="truncate leading-relaxed">
                      {displayTitle}
                    </span>
                    <span className={`font-mono text-[9px] shrink-0 ${
                      isActive ? "text-ink font-bold" : "text-muted"
                    }`}>
                      {(index + 1).toString().padStart(2, "0")}
                    </span>
                  </button>
                );
              })
            )}
          </nav>
        </>
      ) : (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-paper-2/20">
          <p className="text-xs text-muted font-mono leading-relaxed max-w-[200px]">
            [ Hướng dẫn: Vui lòng chọn anime ở danh sách lưu trữ bên dưới ]
          </p>
        </div>
      )}
    </aside>
  );
};
