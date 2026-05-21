import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trash2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getTrashedNotesService,
  restoreNoteService,
  deletePermanentService,
} from "../services/note.service";
import {
  setTrashedNotes,
  restoreNoteState,
  deletePermanentState,
  setNoteLoading,
} from "../features/noteSlice";
import { handleApiError } from "../utils/handleApiError";
import NoteCard from "../components/NoteCard";
import toast from "react-hot-toast";

const Trash = () => {
  const dispatch = useDispatch();
  const { trashedNotes, loading } = useSelector((state) => state.notes);

  useEffect(() => {
    const fetchTrash = async () => {
      dispatch(setNoteLoading(true));
      try {
        const res = await getTrashedNotesService();
        dispatch(setTrashedNotes(res.data));
      } catch (err) {
        handleApiError(err);
      } finally {
        dispatch(setNoteLoading(false));
      }
    };
    fetchTrash();
  }, [dispatch]);

  const handleAction = async (type, id) => {
    try {
      if (type === "restore") {
        const res = await restoreNoteService(id);
        dispatch(restoreNoteState(res.data));
        toast.success("Note restored to dashboard");
      } else {
        if (!window.confirm("This action is permanent. Are you sure?")) return;
        await deletePermanentService(id);
        dispatch(deletePermanentState(id));
        toast.success("Note deleted permanently");
      }
    } catch (err) {
      handleApiError(err);
    }
  };

  if (loading) {
    return <p className="text-center py-20">Loading trash...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/dashboard"
            className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-900"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-black text-slate-900">Trash Bin</h1>
        </div>

        {trashedNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trashedNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                isTrash={true}
                onAction={handleAction}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <Trash2 size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium">Your trash is empty.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trash;
