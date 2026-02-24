"use client";

import React, { useState, useEffect, useRef } from "react";
import abcjs from "abcjs";
import { saveRepertoireContent } from "@/lib/github";
import "abcjs/abcjs-audio.css";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface EditorProps {
  initialContent: string;
  initialSha: string;
  accessToken: string;
  repoName?: string;
  filePath?: string;
}

export default function Editor({ initialContent, initialSha, accessToken, repoName, filePath }: EditorProps) {
  const [abc, setAbc] = useState(initialContent);
  const [sha, setSha] = useState(initialSha);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const synthControllerRef = useRef<any>(null);

  // Warn on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Render visual
      const visualObj = abcjs.renderAbc("paper", abc, { responsive: "resize" });

      // Render audio
      if (abcjs.synth.supportsAudio()) {
        if (!synthControllerRef.current) {
          synthControllerRef.current = new abcjs.synth.SynthController();
          synthControllerRef.current.load("#audio", null, {
            displayLoop: true,
            displayRestart: true,
            displayPlay: true,
            displayProgress: true,
            displayWarp: true,
          });
        }

        const createSynth = new abcjs.synth.CreateSynth();
        createSynth.init({ visualObj: visualObj[0] }).then(() => {
          if (synthControllerRef.current) {
            synthControllerRef.current.setTune(visualObj[0], false, {})
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .catch((error: any) => console.warn("Audio problem:", error));
          }
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .catch((error: any) => {
          console.warn("Audio problem:", error);
        });
      }
    }
  }, [abc]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const newSha = await saveRepertoireContent(accessToken, abc, sha, repoName, filePath);
      if (newSha) {
        setSha(newSha);
        setIsDirty(false);
        alert("Saved successfully!");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen flex-col md:flex-row">
      <div className="w-full md:w-1/2 p-4 flex flex-col border-r border-gray-300">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">ABC Editor</h2>
            <div className="text-sm text-gray-500 mt-1">
              {repoName && (
                <>
                  <Link href={`/?repo=${repoName}`} className="hover:underline text-blue-600">
                    {repoName}
                  </Link>
                  <span className="mx-1">/</span>
                </>
              )}
              <span>{filePath || "New File"}</span>
              {isDirty && <span className="ml-2 text-amber-600 font-semibold">(Unsaved)</span>}
            </div>
          </div>
          <button
            onClick={() => {
              if (isDirty && !window.confirm("You have unsaved changes. Are you sure you want to sign out?")) {
                return;
              }
              signOut();
            }}
            className="text-sm text-red-600 hover:underline"
          >
            Sign out
          </button>
        </div>
        <textarea
          className="flex-1 w-full p-2 border border-gray-300 rounded resize-none font-mono text-sm"
          value={abc}
          onChange={(e) => {
            setAbc(e.target.value);
            setIsDirty(true);
          }}
          placeholder="Enter ABC notation here..."
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 rounded text-white font-semibold transition-colors ${
              saving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {saving ? "Saving..." : "Save to GitHub"}
          </button>
        </div>
      </div>
      <div className="w-full md:w-1/2 p-4 flex flex-col bg-gray-50 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Preview</h2>
        <div id="audio" className="mb-4"></div>
        <div id="paper" className="flex-1 bg-white border border-gray-200 p-4 rounded shadow-sm"></div>
      </div>
    </div>
  );
}
