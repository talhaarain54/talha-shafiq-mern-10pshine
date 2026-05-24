import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Save, ArrowLeft, Trash2, Download, X, Tag } from "lucide-react";
import { createNoteService, updateNoteService, getNoteByIdService, trashNoteService } from "../services/note.service";
import { handleApiError } from "../utils/handleApiError";
import toast from "react-hot-toast";
import ErrorBoundary from "../components/ErrorBoundary";
import { addNote, updateNoteState } from "../features/noteSlice";
import { useDispatch, useSelector } from "react-redux";

const NoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDark = useSelector((s) => s.theme.mode === "dark");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const isNew = id === "new";

  useEffect(() => {
    if (!isNew && /^[a-f\d]{24}$/i.test(id)) {
      const fetchNote = async () => {
        try {
          const res = await getNoteByIdService(id);
          setTitle(res.data.title);
          setContent(res.data.content);
          setTags(res.data.tags || []);
        } catch (err) {
          handleApiError(err);
          navigate("/dashboard");
        }
      };
      fetchNote();
    }
  }, [id, navigate, isNew]);

  const addTag = (raw) => {
    const tag = raw.trim().toLowerCase().replace(/[^a-z0-9\s\-_]/g, "");
    if (!tag || tags.includes(tag) || tags.length >= 10) return;
    setTags((prev) => [...prev, tag]);
    setTagInput("");
  };

  const removeTag = (tag) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleTagKeyDown = (e) => {
    if (["Enter", ",", " "].includes(e.key)) { e.preventDefault(); addTag(tagInput); }
    if (e.key === "Backspace" && !tagInput && tags.length > 0) removeTag(tags[tags.length - 1]);
  };

  const handleSave = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      if (isNew) {
        const res = await createNoteService({ title, content, tags });
        dispatch(addNote(res.data));
        toast.success("Note created successfully");
      } else {
        const res = await updateNoteService(id, { title, content, tags });
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

  const handleExportPDF = async () => {
    if (!title && !content) { toast.error("Nothing to export"); return; }
    const toastId = toast.loading("Generating PDF...");
    try {
      const { default: html2pdf } = await import("html2pdf.js");
      const element = document.createElement("div");
      element.style.fontFamily = "-apple-system, sans-serif";
      element.style.padding = "40px";
      element.innerHTML = `
        <h1 style="font-size:28px;font-weight:900;color:#0f172a;margin-bottom:8px;">${title || "Untitled Note"}</h1>
        <div style="font-size:12px;color:#94a3b8;margin-bottom:24px;">
          Exported from NoteBase • ${new Date().toLocaleDateString()}
          ${tags.length ? `<br/>Tags: ${tags.join(", ")}` : ""}
        </div>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin-bottom:24px;" />
        <div style="font-size:15px;line-height:1.7;color:#334155;">${content || "<p>No content</p>"}</div>
      `;
      await html2pdf().set({
        margin: [15, 20],
        filename: `${title || "notebase-note"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }).from(element).save();
      toast.success("PDF exported!", { id: toastId });
    } catch (err) {
      toast.error("PDF export failed.", { id: toastId });
    }
  };

  const navBg = isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-100";
  const pageBg = isDark ? "bg-slate-900" : "bg-white";
  const labelColor = isDark ? "text-slate-400" : "text-slate-400";
  const titleInput = isDark
    ? "w-full text-3xl font-black text-white placeholder:text-slate-700 outline-none mb-4 tracking-tighter bg-transparent"
    : "w-full text-3xl font-black text-slate-900 placeholder:text-slate-100 outline-none mb-4 tracking-tighter";
  const tagContainer = isDark
    ? "flex flex-wrap items-center gap-2 min-h-[42px] w-full px-3 py-2 rounded-xl border border-slate-600 bg-slate-800 focus-within:ring-2 focus-within:ring-blue-500"
    : "flex flex-wrap items-center gap-2 min-h-[42px] w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-blue-500";
  const tagChip = isDark
    ? "flex items-center gap-1 bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full text-xs font-bold"
    : "flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold";
  const tagInputClass = isDark
    ? "flex-1 min-w-[100px] outline-none text-sm bg-transparent text-white placeholder:text-slate-500"
    : "flex-1 min-w-[100px] outline-none text-sm bg-transparent placeholder:text-slate-300";

  return (
    <div className={`min-h-screen ${pageBg}`}>
      <nav className={`border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 ${navBg}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")}
            className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-50 text-slate-600"}`}>
            <ArrowLeft size={20} />
          </button>
          <span className={`text-sm font-bold uppercase tracking-widest ${labelColor}`}>
            {isNew ? "New Note" : "Editing Note"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleExportPDF}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${isDark ? "bg-slate-700 text-slate-200 hover:bg-slate-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            <Download size={16} />
            <span className="hidden sm:inline">Export PDF</span>
          </button>

          {!isNew && (
            <button onClick={handleTrash}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold hover:bg-red-100 transition-all">
              <Trash2 size={16} />
              <span className="hidden sm:inline">Trash</span>
            </button>
          )}

          <button disabled={saving} onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50">
            <Save size={18} /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-8 lg:p-12">
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Note" className={titleInput} />

        {/* Tags Input */}
        <div className="mb-6">
          <label className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            <Tag size={12} /> Tags
          </label>
          <div className={tagContainer}>
            {tags.map((tag) => (
              <span key={tag} className={tagChip}>
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400 transition-colors ml-0.5">
                  <X size={12} />
                </button>
              </span>
            ))}
            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown} onBlur={() => tagInput && addTag(tagInput)}
              placeholder={tags.length === 0 ? "Add tags (press Enter or comma)..." : ""}
              className={tagInputClass} disabled={tags.length >= 10} />
          </div>
          {tags.length >= 10 && <p className="text-xs text-amber-500 mt-1">Maximum 10 tags reached</p>}
        </div>

        <ErrorBoundary>
          <ReactQuill theme="snow" value={content} onChange={setContent}
            className="text-lg h-48" placeholder="Start typing your thoughts..." />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default NoteEditor;
