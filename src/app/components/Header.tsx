"use client";

import { useEffect, useState } from "react";

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
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {title}
      </h1>
      {name && (
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Signed in as: <span className="font-medium">{name}</span>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("myName");
              window.location.href = "/";
            }}
            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
