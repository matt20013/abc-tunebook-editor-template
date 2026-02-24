"use client";

import Link from "next/link";
import React from "react";
import { signOut } from "next-auth/react";
import { FileItem } from "@/types/github";

interface FileListProps {
  files: FileItem[];
  repoName: string;
  currentPath: string;
}

export default function FileList({ files, repoName, currentPath }: FileListProps) {
  // Sort: directories first, then files
  const sortedFiles = [...files].sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === "dir" ? -1 : 1;
  });

  const parentPath = currentPath.split("/").slice(0, -1).join("/");

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 p-8">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Files in <span className="text-blue-600">{repoName}</span>
            </h1>
            <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
              <Link href="/" className="hover:underline text-blue-500">
                Repositories
              </Link>
              <span>/</span>
              <span>{repoName}</span>
              {currentPath && (
                  <>
                      <span>/</span>
                      <span>{currentPath}</span>
                  </>
              )}
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
          >
            Sign out
          </button>
        </div>

        <ul className="divide-y divide-gray-200">
          {currentPath && (
              <li className="hover:bg-gray-50 transition-colors">
                  <Link
                      href={`/?repo=${repoName}&path=${parentPath}`}
                      className="block p-4 pl-6"
                  >
                      <div className="flex items-center">
                          <span className="mr-2 text-gray-500">📁</span>
                          <span className="text-gray-900 font-medium">..</span>
                      </div>
                  </Link>
              </li>
          )}
          {sortedFiles.length === 0 ? (
            <li className="p-6 text-center text-gray-500">
              No files found.
            </li>
          ) : (
            sortedFiles.map((file) => (
              <li key={file.path} className="hover:bg-gray-50 transition-colors">
                {file.type === "dir" ? (
                  <Link
                      href={`/?repo=${repoName}&path=${file.path}`}
                      className="block p-4 pl-6"
                  >
                      <div className="flex items-center">
                          <span className="mr-2 text-blue-500">📁</span>
                          <span className="text-gray-900 font-medium">{file.name}</span>
                      </div>
                  </Link>
                ) : (
                  <Link
                    href={`/?repo=${repoName}&file=${encodeURIComponent(file.path)}`}
                    className="block p-4 pl-6"
                  >
                    <div className="flex items-center">
                       <span className="mr-2 text-gray-500">📄</span>
                       <span className="text-gray-900 font-medium">{file.name}</span>
                    </div>
                  </Link>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
