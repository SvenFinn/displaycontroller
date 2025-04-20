"use client";

import { useState } from "react";
import FileManager from "@frontend/app/components/FileManager";

function App() {
  const [files, setFiles] = useState([
    {
      name: "Documents",
      isDirectory: true, // Folder
      path: "/Documents", // Located in Root directory
      updatedAt: "2024-09-09T10:30:00Z", // Last updated time
    },
    {
      name: "Pictures",
      isDirectory: true,
      path: "/Pictures", // Located in Root directory as well
      updatedAt: "2024-09-09T11:00:00Z",
    },
    {
      name: "Pic.png",
      isDirectory: false, // File
      path: "/Pictures/Pic.png", // Located inside the "Pictures" folder
      updatedAt: "2024-09-08T16:45:00Z",
      size: 2048, // File size in bytes (example: 2 KB)
    },
    { 
      name:"testing",
      isDirectory: true,
      path: "/Documents/testing",
      updatedAt: "2024-09-09T10:30:00Z",
    }
  ]);

  return (
    <>
      <FileManager files={files} />
    </>
  );
}

export default App;