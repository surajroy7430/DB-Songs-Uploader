import { cn } from "../lib/utils";
import { useId, useState } from "react";
import { useSongForm } from "../context/SongContext";
import {
  Calendar,
  CassetteTape,
  Copyright,
  Disc3,
  DiscAlbum,
  FileKey2,
  FileMusic,
  Guitar,
  Hourglass,
  Languages,
  Link,
  MicVocal,
  Music2,
  UserPen,
  UserPlus,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import axios from "axios";

const TextInputField = ({
  name,
  control,
  label,
  placeholder,
  icon: Icon,
  type = "text",
  ...props
}) => {
  const id = useId();

  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem className="mt-3">
          {label && <FormLabel htmlFor={id}>{label}</FormLabel>}

          <FormControl>
            <div className="relative">
              {Icon && (
                <Icon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              )}
              <Input
                id={id}
                type={type}
                placeholder={placeholder}
                {...field}
                {...props}
                className={cn(Icon ? "pl-8" : "", props.className)}
              />
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default function SongUploadForm() {
  const {
    form,
    uploadPreview,
    saveSong,
    showLyrics,
    setShowLyrics,
    toggleLyrics,
    handleLyricsChange,
  } = useSongForm();
  const [artistInput, setArtistInput] = useState("");
  const [artists, setArtists] = useState([]);
  const [fileSize, setFileSize] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  const defaultFormValues = {
    title: "",
    album: "",
    artists: [],
    language: "",
    duration: 1,
    releasedYear: new Date().getFullYear(),
    type: "",
    genre: [],
    lyricsData: { hasLyrics: false, lyrics: [], writers: "", poweredBy: "" },
    coverImageKey: "",
    copyright: "",
    tempPath: "",
    songFile: null,
  };

  const isProcessing = status !== "";
  const genre = form.watch("genre") || [];

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    form.setValue("songFile", file);

    try {
      // Step 1: Audio Compression
      if (file.size >= 6 * 1024 * 1024) {
        setProgress(0);
        setStatus("Compressing Audio...");

        for (let i = 1; i <= 100; i += 20) {
          await new Promise((r) => setTimeout(r, 80));
          setProgress(i);
        }
      }

      // Step 2: Extracting Metadata
      setProgress(0);
      setStatus("Extracting Metadata...");
      for (let i = 1; i <= 100; i += 20) {
        await new Promise((r) => setTimeout(r, 80));
        setProgress(i);
      }

      const res = await uploadPreview(file);
      if (res?.fileSize) setFileSize(res.fileSize);
      toast.info("Preview extracted successfully");

      setTimeout(() => {
        setProgress(0);
        setStatus("");
      }, 800);

      const previewArtists = form.getValues("artists") || [];
      setArtists(previewArtists);
    } catch (error) {
      console.error("Preview failed:", error);
      toast.error("Failed to extract preview");
      setProgress(0);
      setStatus("");
    }

    e.target.value = "";
  };

  const addArtist = () => {
    const names = artistInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const newArtists = [
      ...artists,
      ...names.map((name) => ({ name, bio: "", imageUrl: "" })),
    ];

    setArtists(newArtists);
    form.setValue("artists", newArtists, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setArtistInput("");
  };

  const updateSinger = (index, key, value) => {
    const newArtists = [...artists];
    newArtists[index][key] = value;

    setArtists(newArtists);
    form.setValue("artists", newArtists, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const removeSinger = (index) => {
    const newArtists = artists.filter((_, i) => i !== index);

    setArtists(newArtists);
    form.setValue("artists", newArtists, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onGenreChange = (e) => {
    const arr = e.target.value
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    form.setValue("genre", arr, { shouldValidate: true, shouldDirty: true });
  };

  const resetForm = async () => {
    try {
      const tempPath = form.getValues("tempPath");

      if (tempPath) {
        try {
          await axios.post(
            `${import.meta.env.VITE_BASE_URL}/minxs-music/api/preview/reset`,
            {
              tempPath,
            }
          );
        } catch (error) {
          console.warn(error);
          toast.warning("Failed to delete preview file");
        }
      }
    } finally {
      form.reset(defaultFormValues);
      form.setValue("songFile", null);
      form.setValue("tempPath", "");
      setArtists([]);
      setArtistInput("");
      setShowLyrics(false);
      setFileSize(null);
    }
  };

  const onSubmit = async (values) => {
    try {
      setProgress(0);
      setStatus("Uploading Song...");
      for (let i = 1; i <= 100; i += 10) {
        await new Promise((r) => setTimeout(r, 100));
        setProgress(i);
      }

      const res = await saveSong(values);
      toast.success("Song saved! ID: " + res?.songId);

      resetForm();

      setTimeout(() => {
        setProgress(0);
        setStatus("");
      }, 800);
    } catch (error) {
      console.error("Error while saving song:", error);
      toast.error(error.response?.data?.error || "Failed to saved song.");
      setProgress(0);
      setStatus("");
    }
  };
  const onError = (err) => {
    console.log("VALIDATION ERRORS", err);
    setProgress(0);
    setStatus("");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="flex flex-col gap-4 p-6 bg-card rounded-lg"
      >
        <FormField
          name="songFile"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div
                  onDrop={(e) => {
                    if (isProcessing) return; // disable drag drop
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) onFileChange({ target: { files: [file] } });
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={(e) => e.preventDefault()}
                  className={
                    isProcessing ? "opacity-50 pointer-events-none" : ""
                  }
                >
                  <Label
                    className={cn(
                      "flex flex-col items-center justify-center border border-dashed bg-zinc-800/40 hover:bg-zinc-800 rounded cursor-pointer transition text-center min-h-[200px]",
                      isProcessing && "cursor-not-allowed opacity-50",
                      form.formState.errors.songFile
                        ? "border-red-500"
                        : "border-zinc-600"
                    )}
                  >
                    <FileMusic size={40} className="text-zinc-400" />
                    <p className="mb-0 mt-2 text-sm text-blue-200">
                      {form.getValues("songFile")?.name ||
                        "Choose audio file or drag & drop"}
                    </p>
                    <Input
                      type="file"
                      accept="audio/*"
                      disabled={isProcessing}
                      className="hidden"
                      onChange={(e) => {
                        if (isProcessing) return;

                        field.onChange(e.target.files?.[0]);
                        onFileChange(e);
                      }}
                    />
                  </Label>
                </div>
              </FormControl>

              {status && (
                <div className="flex flex-col gap-1 mt-3">
                  <p className="text-xs text-blue-300">
                    {status} ({progress}%)
                  </p>
                  <Progress value={progress} className="h-2 bg-zinc-700" />
                </div>
              )}

              {fileSize && (
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    {`Size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`}
                  </Badge>
                </div>
              )}
            </FormItem>
          )}
        />
        <hr />

        {/* Title */}
        <TextInputField
          name="title"
          control={form.control}
          label="Title"
          placeholder="song title"
          icon={Music2}
        />

        {/* Album */}
        <TextInputField
          name="album"
          control={form.control}
          label="Album"
          placeholder="song album"
          icon={Disc3}
        />

        {/* Artists */}
        <div className="flex flex-col gap-2">
          <FormLabel>Artists</FormLabel>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Guitar className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="artist names (comma-seperated)"
                value={artistInput}
                onChange={(e) => setArtistInput(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button type="button" onClick={addArtist}>
              <UserPlus className="h-4 w-4" strokeWidth={3} />
            </Button>
          </div>

          {artists.length > 0 && (
            <div className="overflow-x-auto mt-2 rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px] border text-center">
                      Artist Name
                    </TableHead>
                    <TableHead className="w-[200px] border text-center">
                      Bio
                    </TableHead>
                    <TableHead className="w-[250px] border text-center">
                      Image Url
                    </TableHead>
                    <TableHead className="w-[80px] border text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {artists.map((singer, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="p-2 border">
                        <Input
                          className="w-full"
                          value={singer.name}
                          placeholder="Name"
                          onChange={(e) =>
                            updateSinger(idx, "name", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell className="p-2 border">
                        <Input
                          className="w-full"
                          value={singer.bio}
                          placeholder="Bio"
                          onChange={(e) =>
                            updateSinger(idx, "bio", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell className="p-2 border">
                        <Input
                          className="w-full"
                          value={singer.imageUrl}
                          placeholder="Image Url"
                          onChange={(e) =>
                            updateSinger(idx, "imageUrl", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell className="p-2 text-center border">
                        <Button
                          size="icon"
                          type="button"
                          variant="destructive"
                          onClick={() => removeSinger(idx)}
                        >
                          X
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Language */}
        <TextInputField
          name="language"
          control={form.control}
          label="Language"
          placeholder="audio language"
          icon={Languages}
        />

        {/* Released Year */}
        <TextInputField
          name="releasedYear"
          control={form.control}
          label="Released Year"
          placeholder="released year (YYYY)"
          icon={Calendar}
        />

        {/* Duration */}
        <TextInputField
          name="duration"
          control={form.control}
          label="Total Duration"
          placeholder="duration (seconds)"
          icon={Hourglass}
        />

        <FormField
          name="genre"
          control={form.control}
          render={() => (
            <FormItem>
              <FormLabel>Genre</FormLabel>
              <FormControl>
                <div className="relative">
                  <CassetteTape className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="genre (comma-seperated)"
                    defaultValue={genre.join(", ")}
                    onChange={onGenreChange}
                    className="pl-8"
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Cover Image Key */}
        <TextInputField
          name="coverImageKey"
          control={form.control}
          label="Cover Image Key"
          placeholder="covers/filename"
          icon={FileKey2}
        />
        {/* Album Cover Key */}
        <TextInputField
          name="albumCoverKey"
          control={form.control}
          label="Album Image Key"
          placeholder="albums/filename"
          icon={FileKey2}
        />

        {/* Cover Image URL */}
        <TextInputField
          name="clientCoverImageUrl"
          control={form.control}
          label="Cover Image URL (Optional)"
          placeholder="copy and paste url"
          icon={Link}
        />
        {/* Album Image URL */}
        <TextInputField
          name="clientAlbumCoverUrl"
          control={form.control}
          label="Album Image URL (Optional)"
          placeholder="copy and paste url"
          icon={Link}
        />

        {/* Copyright */}
        <TextInputField
          name="copyright"
          control={form.control}
          label="Copyright"
          placeholder="copyright"
          icon={Copyright}
        />

        <div className="flex flex-col gap-2">
          <Label>
            <span>Has Lyrics?</span>
            <Switch checked={showLyrics} onCheckedChange={toggleLyrics} />
            <span className="text-muted-foreground/70 pl-3">[__BREAK__]</span>
          </Label>

          {showLyrics && (
            <>
              <div className="relative">
                <MicVocal className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Textarea
                  placeholder="Enter lyrics here"
                  onChange={handleLyricsChange}
                  rows={8}
                  className="pl-8"
                />
              </div>

              <div className="relative">
                <UserPen className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter writer names (comma seperated)"
                  {...form.register("lyricsData.writers")}
                  className="capitalize pl-8"
                />
              </div>
              <div className="relative">
                <Link className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Lyrics poweredBy (URL) - eg. https://www.musixmatch.com"
                  {...form.register("lyricsData.poweredBy")}
                  className="pl-8"
                />
              </div>
            </>
          )}
        </div>

        <Button
          type="button"
          disabled={form.formState.isSubmitting}
          onClick={resetForm}
          className="cursor-pointer text-white bg-red-500 hover:bg-red-600 py-5.5"
        >
          Reset
        </Button>

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="cursor-pointer py-6 text-white bg-emerald-600 hover:bg-emerald-700"
        >
          {form.formState.isSubmitting ? "Saving..." : "Save Song"}
        </Button>
      </form>
    </Form>
  );
}
