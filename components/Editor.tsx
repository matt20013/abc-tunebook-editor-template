"use client";

import React, { useState, useEffect, useRef } from "react";
import abcjs from "abcjs";
import { saveRepertoireContent } from "@/lib/github";
import "abcjs/abcjs-audio.css";

interface EditorProps {
  initialContent: string;
  initialSha: string;
  accessToken: string;
}

export default function Editor({ initialContent, initialSha, accessToken }: EditorProps) {
  const [abc, setAbc] = useState(initialContent);
  const [sha, setSha] = useState(initialSha);
  const [saving, setSaving] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const synthControllerRef = useRef<any>(null);

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
      const newSha = await saveRepertoireContent(accessToken, abc, sha);
      if (newSha) {
        setSha(newSha);
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
        <h2 className="text-xl font-bold mb-4">ABC Editor</h2>
        <textarea
          className="flex-1 w-full p-2 border border-gray-300 rounded resize-none font-mono text-sm"
          value={abc}
          onChange={(e) => setAbc(e.target.value)}
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
