"use client";

import { useEffect, useRef, useState } from "react";
import AccountLinks from "./AccountLinks";

export default function AccountNavgation() {
  const [showLinks, setShowLinks] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const handleShowLinks = () => {
    setShowLinks(!showLinks);
  };

  useEffect(() => {
    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowLinks(false);
      }

      if (showLinks) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    };

    document.addEventListener("mousedown", handleClickOutside);
  }, [showLinks]);
  return (
    <>
      <button
        onClick={handleShowLinks}
        className="text-lg p-2 mt-4 border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition-all duration-300 ease-in-out cursor-pointer"
      >
        Your account
      </button>
      {showLinks && (
        <div ref={wrapperRef}>
          <AccountLinks />
        </div>
      )}
    </>
  );
}
