import { Toaster } from "@/components/ui/sonner";
import SongUploadForm from "./components/SongUploadForm";

const App = () => {
  return (
    <div className="min-h-screen p-6 max-w-5xl w-full mx-auto">
      <SongUploadForm />

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
};

export default App;
