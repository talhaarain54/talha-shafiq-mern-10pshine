import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, FileText } from "lucide-react";
import { getNotesService, trashNoteService } from "../services/note.service";
import { setNotes, removeNote, setNoteLoading } from "../features/noteSlice";
import { handleApiError } from "../utils/handleApiError";
import toast from "react-hot-toast";
import NoteCard from "../components/NoteCard";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { notes, loading } = useSelector((state) => state.notes);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchActiveNotes = async () => {
    dispatch(setNoteLoading(true));
    try {
      const res = await getNotesService(searchQuery);
      dispatch(setNotes(res.data)); 
    } catch (err) {
      handleApiError(err);
    } finally {
      dispatch(setNoteLoading(false));
    }
  };

  useEffect(() => {
    fetchActiveNotes();
  }, []);


useEffect(() => {
  const delay = setTimeout(() => {
    fetchActiveNotes(); 
  }, 500);
  return () => clearTimeout(delay);
}, [searchQuery]);

  // 2. Trash Logic (Soft Delete)
  const handleTrash = async (id) => {
    if (!window.confirm("Move this note to trash?")) return;

    try {
      await trashNoteService(id);
      dispatch(removeNote(id));
      toast.success("Note moved to trash");
    } catch (err) {
      handleApiError(err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Welcome back, {user?.name?.split(" ")[0]}!
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              {loading
                ? "Refreshing notes..."
                : `You have ${notes.length} active notes.`}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by title or content..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Notes Logic */}
        {loading && notes.length === 0 ? (
          <div className="flex justify-center py-20 italic text-slate-400 font-medium">
            Loading your thoughts...
          </div>
        ) : notes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {notes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onNavigate={(id) => navigate(`/notes/${id}`)}
                onAction={(type, id) => {
                  if (type === "trash") handleTrash(id);
                }}
              />
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6">
              <FileText size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              {searchQuery ? "No matching notes" : "No notes yet"}
            </h2>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">
              {searchQuery
                ? "Try a different search term or clear the filter."
                : "Your thoughts need a home. Click the button below to create your very first note!"}
            </p>
          </div>
        )}
      </div>

      {/* FLOATING ACTION BUTTON */}
      <button
        onClick={() => navigate("/notes/new")}
        title="Create New Note"
        className="fixed bottom-10 right-10 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-300 hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-50 group"
      >
        <Plus
          size={32}
          className="group-hover:rotate-90 transition-transform duration-300"
        />
      </button>
    </div>
  );
};

export default Dashboard;
