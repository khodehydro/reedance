import React from "react";

// One icon vocabulary across every screen. The glyphs below are from the
// official Flaticon Uicons Regular Rounded font, installed via npm. Keep this
// mapping central so navigation, player, lessons and feedback share one style.
function uicon(glyph) {
  function Icon({
    size = 20,
    className = "",
    style,
    "aria-label": label,
    "aria-hidden": hidden,
    ...props
  }) {
    return (
      <span
        className={`uicon fi-rr-${glyph}${className ? ` ${className}` : ""}`}
        style={{ "--uicon-size": `${size}px`, ...style }}
        role={label ? "img" : undefined}
        aria-label={label}
        aria-hidden={hidden ?? !label}
        data-uicon={glyph}
        {...props}
      />
    );
  }
  Icon.displayName = `Uicon(${glyph})`;
  return Icon;
}

export const ArrowLeft = uicon("arrow-left");
export const ArrowRight = uicon("arrow-right");
export const AudioLines = uicon("waveform-path");
export const BookOpen = uicon("book-open-cover");
export const Bookmark = uicon("bookmark");
export const Check = uicon("check");
export const CheckCircle2 = uicon("check-circle");
export const CloudDownload = uicon("cloud-download");
export const ClipboardCheck = uicon("clipboard-check");
export const Computer = uicon("computer");
export const Compass = uicon("compass-alt");
export const Copy = uicon("copy");
export const Crown = uicon("crown");
export const Download = uicon("download");
export const GraduationCap = uicon("graduation-cap");
export const Headphones = uicon("headphones");
export const House = uicon("home");
export const Info = uicon("info");
export const Languages = uicon("language");
export const Layers3 = uicon("layers");
export const Library = uicon("books");
export const Lightbulb = uicon("lightbulb-on");
export const LockKeyhole = uicon("lock");
export const LockKeyholeOpen = uicon("lock-open-alt");
export const Moon = uicon("moon");
export const Music2 = uicon("music-alt");
export const Pause = uicon("pause");
export const Play = uicon("play");
export const Repeat2 = uicon("arrows-repeat");
export const RotateCcw = uicon("rotate-left");
export const Search = uicon("search");
export const Settings = uicon("settings");
export const Share = uicon("share");
export const SkipBack = uicon("replay-10");
export const SkipForward = uicon("time-forward-ten");
export const Sparkles = uicon("sparkles");
export const Star = uicon("star");
export const Sun = uicon("sun");
export const Table2 = uicon("table");
export const TextSize = uicon("text-size");
export const Trophy = uicon("trophy");
export const User = uicon("user");
export const Volume2 = uicon("volume");
export const VolumeX = uicon("volume-mute");
export const X = uicon("cross-small");
