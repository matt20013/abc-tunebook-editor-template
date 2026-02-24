"use client";

import Link from "next/link";
import React from "react";

// Define a simplified interface for what we expect from the GitHub API
export interface Repo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  updated_at: string | null;
  html_url: string;
}

interface RepoListProps {
  repos: Repo[];
}

export default function RepoList({ repos }: RepoListProps) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 p-8">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Select a Repository</h1>
          <p className="mt-2 text-gray-600">
            Choose a repository to edit your tunebook.
          </p>
        </div>
        <ul className="divide-y divide-gray-200">
          {repos.length === 0 ? (
            <li className="p-6 text-center text-gray-500">
              No repositories found.
            </li>
          ) : (
            repos.map((repo) => (
              <li key={repo.id} className="hover:bg-gray-50 transition-colors">
                <Link
                  href={`/?repo=${repo.full_name}`}
                  className="block p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-blue-600">
                        {repo.full_name}
                      </h3>
                      {repo.description && (
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {repo.description}
                        </p>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      {repo.updated_at && (
                        <span>
                          Updated {new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
