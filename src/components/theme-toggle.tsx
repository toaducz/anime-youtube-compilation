"use client";

import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

export const ThemeToggle = ({ isDarkMode, onToggle }: ThemeToggleProps) => {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-md bg-paper-2 hover:bg-paper-3 border border-rule text-ink-2 hover:text-ink transition-colors duration-150 cursor-pointer flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-focus"
      aria-label={isDarkMode ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
    >
      {isDarkMode ? (
        <SunIcon className="w-4 h-4" />
      ) : (
        <MoonIcon className="w-4 h-4" />
      )}
    </button>
  );
};
