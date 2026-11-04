import Link from "next/link";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mb-4">
        <Compass className="w-8 h-8" />
      </div>
      <span className="text-xs font-black uppercase text-red-600 tracking-wider">404 • पृष्ठ नहीं मिला</span>
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
        Page Not Found
      </h1>
      <p className="text-xs text-slate-500 max-w-sm mt-2">
        जो समाचार या पृष्ठ आप खोज रहे हैं, वह स्थानांतरित हो चुका है या मौजूद नहीं है।
      </p>
      <Link
        href="/"
        className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md transition-all active:scale-95"
      >
        <Home className="w-4 h-4" />
        <span>मुख्य पृष्ठ पर लौटें (Return Home)</span>
      </Link>
    </div>
  );
}

