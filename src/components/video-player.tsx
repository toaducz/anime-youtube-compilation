"use client";

import ReactPlayer from "react-player";

interface VideoPlayerProps {
  url: string | null;
  videoTitle: string;
}

export const VideoPlayer = ({ url, videoTitle }: VideoPlayerProps) => {
  return (
    <section className="flex-1 bg-paper relative flex flex-col justify-center">
      {url ? (
        <div className="flex-1 flex flex-col p-4 md:p-6 flat-border rounded-lg bg-paper-2">
          {/* Metadata Header */}
          <div className="mb-4 flex flex-col gap-1 shrink-0">
            <div className="flex items-center gap-2">
              <span className="uppercase text-[9px] tracking-widest font-mono text-muted font-bold">
                STREAMING DIRECTORY
              </span>
            </div>
            <h2 className="text-base md:text-lg font-bold text-ink leading-snug tracking-tight text-wrap">
              {videoTitle}
            </h2>
          </div>

          {/* Video Player Frame */}
          <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden border border-rule shrink-0">
            <ReactPlayer
              url={url}
              controls
              width="100%"
              height="100%"
              className="absolute top-0 left-0"
              playing
            />
          </div>

          {/* Details & Specs (Document/Tabular style) */}
          <div className="mt-6 border-t border-rule pt-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="uppercase text-[9px] tracking-widest font-mono text-muted font-bold">
                Connection Diagnostics
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[10.5px] font-mono text-ink-2">
              <div className="flex justify-between border-b border-rule pb-2">
                <span className="text-muted">Source Server</span>
                <span className="text-ink font-medium">
                  YouTube Embedded Media
                </span>
              </div>
              <div className="flex justify-between border-b border-rule pb-2">
                <span className="text-muted">Protocol Security</span>
                <span className="text-ink font-medium">HTTPS (TLS v1.3)</span>
              </div>
              <div className="flex justify-between border-b border-rule pb-2">
                <span className="text-muted">Latency Index</span>
                <span className="text-ink font-medium">18 ms</span>
              </div>
              <div className="flex justify-between border-b border-rule pb-2">
                <span className="text-muted">Distribution License</span>
                <span className="text-ink font-medium">
                  Official Publisher Stream
                </span>
              </div>
            </div>

            <p className="mt-4 text-[10px] text-muted leading-relaxed max-w-[500px]">
              Nội dung phát trực tiếp được nhúng từ YouTube. Thiết bị tuân thủ
              quyền sở hữu trí tuệ, không sao chép hay chỉnh sửa nguồn phát gốc
              của Muse VN và Ani-One Vietnam.
            </p>
          </div>
        </div>
      ) : (
        /* Empty State with Faux OS Chrome */
        <div className="flex-1 flex flex-col items-stretch flat-border rounded-lg bg-paper-2/40 overflow-hidden min-h-[350px] md:min-h-[400px]">
          {/* Faux OS Window Chrome */}
          <div className="w-full bg-paper-3/40 border-b border-rule px-4 py-2.5 flex items-center gap-1.5 shrink-0">
            <div className="w-2 h-2 rounded-full bg-muted/30" />
            <div className="w-2 h-2 rounded-full bg-muted/30" />
            <div className="w-2 h-2 rounded-full bg-muted/30" />
          </div>

          {/* Content area */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="max-w-sm flex flex-col items-center">
              <span className="uppercase text-[9px] tracking-[0.25em] font-mono text-muted font-bold mb-4 block">
                CONSOLE IDLE
              </span>

              <h2 className="font-serif text-2xl md:text-3xl text-ink tracking-tight mb-3 italic">
                Chọn Tập Phim Để Khởi Động
              </h2>

              <p className="text-xs text-ink-2 leading-relaxed max-w-[270px] mb-6">
                Vui lòng chọn một bộ anime ở danh mục lưu trữ phía dưới, sau đó
                chọn tập phim tương ứng từ danh sách tập để bắt đầu kết nối.
              </p>

              {/* Status Code Block */}
              <div className="bg-paper-3/30 border border-rule rounded px-3 py-1.5 text-[9px] font-mono text-muted select-none">
                [SYSTEM_STATUS: READY] // [TLS_STREAM: PENDING]
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
