import { Toaster } from "@/components/ui/sonner";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  return (
    <div className="min-h-screen p-6 max-w-7xl w-full mx-auto">
      <AppRoutes />

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
};

export default App;
