import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Save, ArrowLeft, Trash2 } from "lucide-react";
import {
  createNoteService,
  updateNoteService,
  getNoteByIdService,
  trashNoteService,
} from "../services/note.service";
import { handleApiError } from "../utils/handleApiError";
import toast from "react-hot-toast";
import ErrorBoundary from "../components/ErrorBoundary";
import { addNote, updateNoteState } from "../features/noteSlice";
import { useDispatch } from "react-redux";

const NoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (id && id !== "new") {
      const fetchNote = async () => {
        try {
          const res = await getNoteByIdService(id);
          setTitle(res.data.title);
          setContent(res.data.content);
        } catch (err) {
          handleApiError(err);
          navigate("/dashboard");
        }
      };
      fetchNote();
    }
  }, [id, navigate]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);

    try {
      if (id === "new") {
        const res = await createNoteService({ title, content });
        dispatch(addNote(res.data));
        toast.success("Note created successfully");
      } else {
        const res = await updateNoteService(id, { title, content });
        dispatch(updateNoteState(res.data));
        toast.success("Note updated");
      }
      navigate("/dashboard");
    } catch (err) {
      handleApiError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleTrash = async () => {
    if (!window.confirm("Move this note to trash?")) return;
    try {
      await trashNoteService(id);
      toast.success("Note moved to trash");
      navigate("/dashboard");
    } catch (err) {
      handleApiError(err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            {id === "new" ? "New Note" : "Editing Note"}
          </span>
        </div>
        <div className="flex gap-2">
          {id !== "new" && (
            <button
              onClick={handleTrash}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold hover:bg-red-100 transition-all"
            >
              <Trash2 size={18} /> Trash
            </button>
          )}
          <button
            disabled={saving}
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            <Save size={18} /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-8 lg:p-12">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Note"
          className="w-full text-3xl font-black text-slate-900 placeholder:text-slate-100 outline-none mb-8 tracking-tighter"
        />
        <ErrorBoundary>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            className="text-lg text-slate-700 h-44"
            placeholder="Start typing your thoughts..."
          />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default NoteEditor;
