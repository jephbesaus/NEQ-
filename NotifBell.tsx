"use client";

import { useState, useRef, useEffect } from "react";

export default function NotifBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="notif-wrap" ref={ref}>
      <button className="icon-btn" aria-label="Notifications" type="button" onClick={() => setOpen((o) => !o)}>
        <svg viewBox="0 0 24 24" width="21" height="21">
          <path d="M12 3a6 6 0 0 0-6 6v3.6l-1.6 3.2A1 1 0 0 0 5.3 17h13.4a1 1 0 0 0 .9-1.2L18 12.6V9a6 6 0 0 0-6-6Z" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round"/>
          <path d="M9.5 20a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        </svg>
      </button>
      {open && (
        <div className="notif-panel">
          <div className="notif-panel-title">Notifications</div>
          <div className="notif-empty">Aucune notification pour l&apos;instant.</div>
        </div>
      )}
    </div>
  );
}
