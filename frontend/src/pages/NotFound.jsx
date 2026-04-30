import { Link } from 'react-router';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-8">
        <h1 className="text-[12rem] font-black text-slate-200 leading-none select-none">
          404
        </h1>
        <div className="text-2xl font-bold text-slate-900 -mt-10 relative z-10">
          System Error: Page Not Found
        </div>
      </div>

      <p className="text-slate-600 max-w-md mb-10 text-lg">
        The resource you are looking for has been moved, deleted, or never existed in the database.
      </p>

      <Link
        to="/"
        className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-xl active:scale-95"
      >
        Return to Home
      </Link>

    </div>
  );
}