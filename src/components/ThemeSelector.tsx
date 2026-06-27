"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

const THEMES = [
  { id: 'default', label: 'Default', icon: '🌑' },
  { id: 'hearts', label: 'Falling Hearts', icon: '❤️' },
  { id: 'snow', label: 'Snow', icon: '❄️' },
  { id: 'matrix', label: 'Matrix Rain', icon: '🟩' },
  { id: 'galaxy', label: 'Galaxy', icon: '✨' },
  { id: 'ocean', label: 'Ocean', icon: '🌊' },
  { id: 'fire', label: 'Fire', icon: '🔥' },
  { id: 'sakura', label: 'Sakura', icon: '🌸' },
  { id: 'rain', label: 'Rain', icon: '🌧' },
  { id: 'clouds', label: 'Clouds', icon: '☁' },
  { id: 'neon', label: 'Neon', icon: '🎆' },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[100]" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 flex items-center justify-center text-2xl rounded-full bg-white/10 hover:bg-white/20 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] backdrop-blur-md transition-all duration-300 hover:scale-110"
        title="Select Theme"
      >
        ✨
      </button>

      {isOpen && (
        <div className="absolute top-16 right-0 w-56 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 space-y-1 max-h-[70vh] overflow-y-auto">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id as any);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 ${
                  theme === t.id
                    ? 'bg-white/20 text-white font-medium shadow-inner'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-xl">{t.icon}</span>
                <span className="text-sm tracking-wide">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
