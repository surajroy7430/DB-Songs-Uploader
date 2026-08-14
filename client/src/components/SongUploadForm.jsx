import axios from "axios";
import { cn } from "../lib/utils";
import { useId, useState } from "react";
import { useSongForm } from "../context/SongContext";
import {
  Calendar,
  CassetteTape,
  Disc3,
  FileKey2,
  FileMusic,
  FileType,
  Guitar,
  Hourglass,
  ImageIcon,
  Languages,
  Link,
  MicVocal,
  Music2,
  Sparkles,
  Trash2,
  UserPen,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const SectionHead = ({ icon: Icon, title, hint, children }) => (
  <section className="panel rounded-2xl p-5 sm:p-6">
    <header className="mb-5 flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
        {Icon && <Icon className="h-4 w-4" />}
      </span>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
          {title}
        </h2>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
    </header>
    {children}
  </section>
);

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
          {label && (
            <FormLabel
              htmlFor={id}
              className="text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground"
            >
              {label}
            </FormLabel>
          )}

          <FormControl>
            <div className="relative">
              {Icon && (
                <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              )}
              <Input
                id={id}
                type={type}
                placeholder={placeholder}
                {...field}
                {...props}
                className={cn(
                  "h-11 rounded-xl border-border/70 bg-secondary/40 transition-colors focus-visible:bg-secondary/70",
                  Icon ? "pl-9" : "",
                  props.className,
                )}
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
  const [artistRole, setArtistRole] = useState("artist");
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
    type: "song",
    genre: [],
    label: { name: "", logoUrl: "", copyright: "" },
    lyricsData: { hasLyrics: false, lyrics: [], writers: "", poweredBy: "" },
    coverImageKey: "",
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
      ...names.map((name) => ({
        name,
        role: artistRole,
        bio: "",
        imageUrl: "",
      })),
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
            },
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
        className="flex flex-col gap-5"
      >
        {/* ---------------- Upload ---------------- */}
        <FormField
          name="songFile"
          control={form.control}
          render={({ field }) => (
            <FormItem className="panel rounded-2xl p-5 sm:p-6">
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
                    isProcessing ? "pointer-events-none opacity-50" : ""
                  }
                >
                  <Label
                    className={cn(
                      "group relative flex min-h-[220px] w-full cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-dashed bg-secondary/30 text-center transition-all duration-300 hover:bg-secondary/60 hover:glow-ring",
                      isProcessing && "cursor-not-allowed opacity-50",
                      form.formState.errors.songFile
                        ? "border-destructive"
                        : "border-border",
                    )}
                  >
                    <span className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-primary transition-transform duration-300 group-hover:scale-105">
                      <FileMusic size={28} />
                    </span>
                    <p className="max-w-[80%] truncate text-sm font-medium text-foreground">
                      {form.getValues("songFile")?.name ||
                        "Drop your audio file here"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      or click to browse — metadata is extracted automatically
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
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-primary">{status}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {progress}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>
              )}

              {fileSize && (
                <div className="mt-3">
                  <Badge
                    variant="secondary"
                    className="rounded-full px-3 py-1 text-xs font-medium"
                  >
                    {`Size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`}
                  </Badge>
                </div>
              )}
            </FormItem>
          )}
        />

        {/* ---------------- Basic Info ---------------- */}
        <SectionHead
          icon={Music2}
          title="Basic Info"
          hint="Core metadata for the track"
        >
          <div className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            <TextInputField
              name="title"
              control={form.control}
              label="Title"
              placeholder="song title"
              icon={Music2}
            />
            <TextInputField
              name="album"
              control={form.control}
              label="Album"
              placeholder="song album"
              icon={Disc3}
            />
            <TextInputField
              name="language"
              control={form.control}
              label="Language"
              placeholder="audio language"
              icon={Languages}
            />
            <TextInputField
              name="releasedYear"
              control={form.control}
              label="Released Year"
              placeholder="released year (YYYY)"
              icon={Calendar}
            />
            <TextInputField
              name="duration"
              control={form.control}
              label="Total Duration"
              placeholder="duration (seconds)"
              icon={Hourglass}
            />
            <TextInputField
              name="type"
              control={form.control}
              label="Type"
              placeholder="song, single"
              icon={FileType}
            />
          </div>

          <FormField
            name="genre"
            control={form.control}
            render={() => (
              <FormItem className="mt-4">
                <FormLabel className="text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">
                  Genre
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <CassetteTape className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="genre (comma-seperated)"
                      defaultValue={genre.join(", ")}
                      onChange={onGenreChange}
                      className="h-11 rounded-xl border-border/70 bg-secondary/40 pl-9"
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          {genre.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {genre.map((g, i) => (
                <Badge
                  key={`${g}-${i}`}
                  variant="outline"
                  className="rounded-full border-primary/40 px-3 py-1 text-xs text-primary"
                >
                  {g}
                </Badge>
              ))}
            </div>
          )}
        </SectionHead>

        {/* ---------------- Cover Images ---------------- */}
        <SectionHead
          icon={ImageIcon}
          title="Cover Images"
          hint="Storage keys and optional direct URLs"
        >
          <div className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
            <TextInputField
              name="coverImageKey"
              control={form.control}
              label="Cover Image Key"
              placeholder="covers/filename"
              icon={FileKey2}
            />
            <TextInputField
              name="albumCoverKey"
              control={form.control}
              label="Album Image Key"
              placeholder="albums/filename"
              icon={FileKey2}
            />
            <TextInputField
              name="clientCoverImageUrl"
              control={form.control}
              label="Cover Image URL (Optional)"
              placeholder="copy and paste url"
              icon={Link}
            />
            <TextInputField
              name="clientAlbumCoverUrl"
              control={form.control}
              label="Album Image URL (Optional)"
              placeholder="copy and paste url"
              icon={Link}
            />
          </div>
        </SectionHead>

        {/* ---------------- Artists ---------------- */}
        <SectionHead
          icon={Users}
          title="Artists & Credits"
          hint="Add performers, then refine their details"
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Guitar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="artist names (comma-seperated)"
                value={artistInput}
                onChange={(e) => setArtistInput(e.target.value)}
                className="h-11 rounded-xl border-border/70 bg-secondary/40 pl-9"
              />
            </div>

            <Select value={artistRole} onValueChange={setArtistRole}>
              <SelectTrigger className="h-11 w-full rounded-xl border-border/70 bg-secondary/40 sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="artist">Artist</SelectItem>
                <SelectItem value="actor">Actor</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              onClick={addArtist}
              className="h-11 rounded-xl px-5"
            >
              <UserPlus className="h-4 w-4" strokeWidth={3} />
              <span className="sm:hidden">Add artist</span>
            </Button>
          </div>

          {artists.length > 0 && (
            <div className="mt-4 overflow-x-auto rounded-xl border border-border/70">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                    <TableHead className="w-[200px] text-xs uppercase tracking-wider">
                      Artist Name
                    </TableHead>
                    <TableHead className="w-[160px] text-xs uppercase tracking-wider">
                      Role
                    </TableHead>
                    <TableHead className="w-[220px] text-xs uppercase tracking-wider">
                      Bio
                    </TableHead>
                    <TableHead className="w-[260px] text-xs uppercase tracking-wider">
                      Image Url
                    </TableHead>
                    <TableHead className="w-[70px] text-center text-xs uppercase tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {artists.map((singer, idx) => (
                    <TableRow key={idx} className="hover:bg-secondary/20">
                      <TableCell className="p-2">
                        <Input
                          className="h-10 w-full rounded-lg border-transparent bg-secondary/40"
                          value={singer.name}
                          placeholder="Name"
                          onChange={(e) =>
                            updateSinger(idx, "name", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Select
                          value={singer.role}
                          onValueChange={(value) =>
                            updateSinger(idx, "role", value)
                          }
                        >
                          <SelectTrigger className="h-10 w-full rounded-lg border-transparent bg-secondary/40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="artist">Artist</SelectItem>
                            <SelectItem value="actor">Actor</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          className="h-10 w-full rounded-lg border-transparent bg-secondary/40"
                          value={singer.bio}
                          placeholder="Bio"
                          onChange={(e) =>
                            updateSinger(idx, "bio", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          className="h-10 w-full rounded-lg border-transparent bg-secondary/40"
                          value={singer.imageUrl}
                          placeholder="Image Url"
                          onChange={(e) =>
                            updateSinger(idx, "imageUrl", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell className="p-2 text-center">
                        <Button
                          size="icon"
                          type="button"
                          variant="destructive"
                          className="h-9 w-9 rounded-lg"
                          onClick={() => removeSinger(idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </SectionHead>

        {/* ---------------- Label ---------------- */}
        <SectionHead
          icon={Sparkles}
          title="Label"
          hint="Rights holder and copyright line"
        >
          <div className="overflow-x-auto rounded-xl border border-border/70">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                  <TableHead className="w-[220px] text-xs uppercase tracking-wider">
                    Label Name
                  </TableHead>
                  <TableHead className="w-[260px] text-xs uppercase tracking-wider">
                    Copyright
                  </TableHead>
                  <TableHead className="w-[260px] text-xs uppercase tracking-wider">
                    Logo Url
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-transparent">
                  <TableCell className="p-2">
                    <Input
                      className="h-10 w-full rounded-lg border-transparent bg-secondary/40"
                      value={form.watch("label.name") || ""}
                      placeholder="Label Name"
                      onChange={(e) =>
                        form.setValue("label.name", e.target.value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      className="h-10 w-full rounded-lg border-transparent bg-secondary/40"
                      value={form.watch("label.copyright") || ""}
                      placeholder="Copyright"
                      onChange={(e) =>
                        form.setValue("label.copyright", e.target.value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      className="h-10 w-full rounded-lg border-transparent bg-secondary/40"
                      value={form.watch("label.logoUrl") || ""}
                      placeholder="Logo Url"
                      onChange={(e) =>
                        form.setValue("label.logoUrl", e.target.value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
                      }
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </SectionHead>

        {/* ---------------- Lyrics ---------------- */}
        <SectionHead
          icon={MicVocal}
          title="Lyrics"
          hint="Optional — one line per lyric line"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <Label className="flex w-fit items-center gap-3 rounded-xl bg-secondary/40 px-4 py-2.5">
                <span className="text-sm font-medium text-foreground">
                  Has Lyrics?
                </span>
                <Switch checked={showLyrics} onCheckedChange={toggleLyrics} />
              </Label>

              <span className="text-sm text-muted-foreground/70">__BREAK__</span>
            </div>

            {showLyrics && (
              <>
                <div className="relative">
                  <MicVocal className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    placeholder="Enter lyrics here"
                    onChange={handleLyricsChange}
                    rows={8}
                    className="rounded-xl border-border/70 bg-secondary/40 pl-9"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="relative">
                    <UserPen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Enter writer names (comma seperated)"
                      {...form.register("lyricsData.writers")}
                      className="h-11 rounded-xl border-border/70 bg-secondary/40 pl-9 capitalize"
                    />
                  </div>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Lyrics poweredBy (URL) - eg. https://www.musixmatch.com"
                      {...form.register("lyricsData.poweredBy")}
                      className="h-11 rounded-xl border-border/70 bg-secondary/40 pl-9"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </SectionHead>

        {/* ---------------- Actions ---------------- */}
        <div className="panel sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl p-4">
          {Object.keys(form.formState.errors).length > 0 && (
            <div className="flex flex-col gap-1 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <span className="font-medium">Please fix the following:</span>
              <ul className="list-inside list-disc space-y-0.5">
                {Object.entries(form.formState.errors).map(([field, error]) => (
                  <li key={field}>{`${field} is required`}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-12 flex-1 cursor-pointer rounded-xl text-sm font-semibold tracking-wide"
            >
              {form.formState.isSubmitting ? "Saving..." : "Save Song"}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={form.formState.isSubmitting}
              onClick={resetForm}
              className="h-12 flex-1 cursor-pointer rounded-xl border-border/70 bg-secondary/30 text-sm font-semibold tracking-wide"
            >
              Reset
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
