"use client";

import Link from "next/link";
import config from "@/config";
import { useEffect, useState } from "react";

const Header = () => {
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }

      setLastScrollY(currentScrollY <= 0 ? 0 : currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isHidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-center">
        <Link className="group" href="/" title={`${config.appName} homepage`}>
          <img
            src="/logonuevo.svg"
            alt={config.appName}
            className="h-9 w-auto group-hover:scale-105 transition-transform"
          />
        </Link>
      </nav>
    </header>
  );
};

export default Header;
