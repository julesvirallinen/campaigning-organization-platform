"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("myName");
    if (storedName) setName(storedName);
  }, []);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4 bg-indigo-600 -mx-3 px-5 py-2">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/titta-black-line_3.png"
            alt="Tittanaattori"
            width={32}
            height={32}
            className="invert brightness-200"
          />
          <span className="text-xl font-bold text-white">TITTANAATTORI</span>
        </Link>
        {name && (
          <div className="flex items-center gap-4">
            <div className="text-sm text-white">
              <span className="font-medium">{name}</span>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("myName");
                window.location.href = "/";
              }}
              className="text-sm text-white hover:text-red-200 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {title}
      </h1>
    </div>
  );
}
