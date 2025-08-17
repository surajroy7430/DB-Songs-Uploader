import { createContext, useContext, useState } from "react";
import axios from "axios";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const SongContext = createContext();
export const useSongForm = () => useContext(SongContext);

const BASE_URL = import.meta.env.VITE_BASE_URL;
const currentYear = new Date().getFullYear();

const songSchema = z.object({
  title: z.string().trim().min(1),
  album: z.string().trim().min(1),
  artists: z.array(z.string().trim()).min(1),
  language: z.string().trim().min(1),
  duration: z.string().trim().min(1),
  releasedYear: z.string().trim().min(1),
  type: z.string().trim().optional().or(z.literal("")),
  genre: z.array(z.string().trim()).min(1),
  lyricsData: z
    .object({
      hasLyrics: z.boolean().default(false),
      lyrics: z.array(z.string()).default([]),
      writers: z.string().trim().optional().or(z.literal("")),
      poweredBy: z.string().trim().optional().or(z.literal("")),
    })
    .optional()
    .default({ hasLyrics: false, lyrics: [] }),
  coverImageKey: z.string().trim().optional().or(z.literal("")),
  albumCoverKey: z.string().trim().optional().or(z.literal("")),
  clientCoverImageUrl: z.string().trim().optional().or(z.literal("")),
  clientAlbumCoverUrl: z.string().trim().optional().or(z.literal("")),
  copyright: z.string().trim().optional().or(z.literal("")),
  songFile: z.any().refine((f) => f instanceof File, "Song file is required"),
});

export const SongProvider = ({ children }) => {
  const form = useForm({
    resolver: zodResolver(songSchema),
    mode: "onSubmit",
    defaultValues: {
      title: "",
      album: "",
      artists: [],
      language: "",
      duration: 1,
      releasedYear: currentYear,
      type: "",
      genre: [],
      lyricsData: {
        hasLyrics: false,
        lyrics: [],
        writers: "",
        poweredBy: "",
      },
      coverImageKey: "",
      albumCoverKey: "",
      clientCoverImageUrl: "",
      clientAlbumCoverUrl: "",
      copyright: "",
      songFile: null,
    },
  });

  const { setValue, getValues } = form;
  const [showLyrics, setShowLyrics] = useState(false);

  const toggleLyrics = (checked) => {
    setShowLyrics(checked);
    setValue("lyricsData.hasLyrics", checked);
  };

  const handleLyricsChange = (e) => {
    const value = e.target.value;

    const lines = value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    setValue("lyricsData.lyrics", lines, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  // Step 1: upload file and auto-populate metadata
  const uploadPreview = async (file) => {
    const data = new FormData();
    data.append("song", file);

    const res = await axios.post(`${BASE_URL}/minxs-music/preview`, data);

    Object.entries(res.data || {}).forEach(([key, val]) => {
      if (["duration", "releasedYear"].includes(key)) {
        val = val !== null ? val.toString() : "";
      }

      // if server returns comma-separated for arrays, normalize to arrays
      if (["artists", "genre"].includes(key) && typeof val === "string") {
        const arr = val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        setValue(key, arr, { shouldValidate: true, shouldDirty: true });
      } else {
        setValue(key, val, { shouldValidate: false, shouldDirty: true });
      }
    });

    setValue("songFile", file, { shouldValidate: true, shouldDirty: true });
    return res.data;
  };

  // Step 2: final submit
  const saveSong = async (values) => {
    const data = new FormData();

    if (values.songFile) data.append("song", values.songFile);

    (values.artists || []).forEach((val) => data.append("artists", val));
    (values.genre || []).forEach((val) => data.append("genre", val));

    if (values.singersInfo) {
      data.append("singersInfo", JSON.stringify(values.singersInfo));
    }

    Object.entries(values).forEach(([key, val]) => {
      if (["songFile", "artists", "genre", "singersInfo"].includes(key)) return;

      if (key === "duration") {
        const float = parseFloat(val);
        if (!isNaN(float)) data.append(key, float);
      } else if (key === "releasedYear") {
        const int = parseInt(val);
        if (!isNaN(int)) data.append(key, int);
      } else if (key === "lyricsData") {
        data.append("lyricsData", JSON.stringify(val));
      } else {
        data.append(key, val);
      }
    });

    const res = await axios.post(`${BASE_URL}/minxs-music/save`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  };

  return (
    <SongContext.Provider
      value={{
        form,
        uploadPreview,
        saveSong,
        showLyrics,
        setShowLyrics,
        toggleLyrics,
        handleLyricsChange,
      }}
    >
      {children}
    </SongContext.Provider>
  );
};
