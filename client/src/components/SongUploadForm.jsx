import { cn } from "@/lib/utils";
import { useState } from "react";
import { useSongForm } from "../context/SongContext";
import { CloudUpload } from "lucide-react";
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
  const [singerInput, setSingerInput] = useState("");
  const [singers, setSingers] = useState([]);
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
    songFile: null,
  };

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
      if (previewArtists.length) {
        const artistNames = previewArtists.flatMap((item) =>
          typeof item === "string"
            ? item
                .split(",")
                .map((name) => name.trim())
                .filter(Boolean)
            : []
        );
        setSingers(
          artistNames.map((name) => ({ name, bio: "", imageUrl: "" }))
        );
      }
    } catch (error) {
      console.error("Preview failed:", error);
      toast.error("Failed to extract preview");
      setProgress(0);
      setStatus("");
    }

    e.target.value = "";
  };

  const addSinger = () => {
    const names = singerInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const newSingers = names.map((name) => ({ name, bio: "", imageUrl: "" }));
    setSingers([...singers, ...newSingers]);
    setSingerInput("");
  };

  const updateSinger = (index, key, value) => {
    const newSingers = [...singers];
    newSingers[index][key] = value;
    setSingers(newSingers);
  };

  const removeSinger = (index) => {
    setSingers(singers.filter((_, i) => i !== index));
  };

  const onGenreChange = (e) => {
    const arr = e.target.value
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    form.setValue("genre", arr, { shouldValidate: true, shouldDirty: true });
  };

  const resetForm = () => {
    form.reset(defaultFormValues);
    form.setValue("songFile", null);
    setSingers([]);
    setSingerInput("");
    setShowLyrics(false);
    setFileSize(null);
  };

  const onSubmit = async (values) => {
    try {
      const finalValues = { ...values, singersInfo: singers };

      setProgress(0);
      setStatus("Uploading Song...");
      for (let i = 1; i <= 100; i += 10) {
        await new Promise((r) => setTimeout(r, 100));
        setProgress(i);
      }

      const res = await saveSong(finalValues);
      toast.success("Song saved! ID: " + res?.songId);

      resetForm();

      setTimeout(() => {
        setProgress(0);
        setStatus("");
      }, 800);
    } catch (error) {
      console.error("Error while saving song:", error);
      toast.error("Failed to saved song.");
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
        className="flex flex-col gap-4 p-6 shadow-lg bg-zinc-900 rounded-lg"
      >
        <FormField
          name="songFile"
          control={form.control}
          render={() => (
            <FormItem>
              <FormControl>
                <div
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) onFileChange({ target: { files: [file] } });
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={(e) => e.preventDefault()}
                >
                  <Label
                    className="flex flex-col items-center justify-center border border-dashed
                    border-zinc-600 bg-zinc-800/40 hover:bg-zinc-800 rounded 
                    cursor-pointer transition text-center min-h-[200px]"
                  >
                    <CloudUpload size={35} className="text-zinc-400" />
                    <p className="mb-0 text-sm text-blue-200">
                      {form.getValues("songFile")?.name ||
                        "Choose audio file or drag & drop"}
                    </p>
                    <Input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={onFileChange}
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

        <FormField
          name="title"
          control={form.control}
          render={({ field }) => (
            <FormItem className="mt-3">
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Title" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="album"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Album</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Album" />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Artists */}
        <div className="flex flex-col gap-2">
          <FormLabel>Artists</FormLabel>
          <div className="flex gap-2">
            <Input
              placeholder="Enter Artist Names"
              value={singerInput}
              onChange={(e) => setSingerInput(e.target.value)}
            />
            <Button type="button" onClick={addSinger}>
              Add
            </Button>
          </div>

          {singers.length > 0 && (
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
                  {singers.map((singer, idx) => (
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

        <FormField
          name="language"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Language" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="releasedYear"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Released Year</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Released Year (YYYY)" />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="duration"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Duration (in seconds)" />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="genre"
          control={form.control}
          render={() => (
            <FormItem>
              <FormLabel>Genre</FormLabel>
              <FormControl>
                <Input
                  placeholder="Genre (comma-seperated)"
                  defaultValue={genre.join(", ")}
                  onChange={onGenreChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="coverImageKey"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Image Key</FormLabel>
              <FormControl>
                <Input placeholder="Cover Image Key" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="albumCoverKey"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Album Cover Key</FormLabel>
              <FormControl>
                <Input placeholder="Album Cover Key" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          name="clientCoverImageUrl"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Image URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Copy and paste url" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          name="clientAlbumCoverUrl"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Album Cover URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Copy and paste url" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="copyright"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Copyright &copy;</FormLabel>
              <FormControl>
                <Input placeholder="copyright" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-2">
          <Label>
            <span>Has Lyrics?</span>
            <Switch checked={showLyrics} onCheckedChange={toggleLyrics} />
          </Label>

          {showLyrics && (
            <>
              <Textarea
                placeholder="Enter lyrics here"
                onChange={handleLyricsChange}
                rows={8}
              />

              <Input
                type="text"
                placeholder="Enter writer names (comma seperated)"
                {...form.register("lyricsData.writers")}
                className="capitalize"
              />
              <Input
                type="text"
                placeholder="Lyrics poweredBy (URL) - eg. https://www.musixmatch.com"
                {...form.register("lyricsData.poweredBy")}
              />
            </>
          )}
        </div>

        <Button
          type="button"
          disabled={form.formState.isSubmitting}
          onClick={resetForm}
          className="cursor-pointer text-white bg-red-500 hover:bg-red-600"
        >
          Reset
        </Button>

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="cursor-pointer text-white bg-green-600 hover:bg-green-700"
        >
          {form.formState.isSubmitting ? "Saving..." : "Save Song"}
        </Button>
      </form>
    </Form>
  );
}
