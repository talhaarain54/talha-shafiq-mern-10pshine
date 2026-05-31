import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, FileText, SlidersHorizontal, Upload, Download } from "lucide-react";
import { getNotesService, getUserTagsService, trashNoteService, importNotesService, exportNotesService } from "../services/note.service";
import { setNotes, removeNote, setNoteLoading } from "../features/noteSlice";
import { handleApiError } from "../utils/handleApiError";
import toast from "react-hot-toast";
import NoteCard from "../components/NoteCard";
import ConfirmModal from "../components/ConfirmModal";

const SORT_OPTIONS = [
  { value: "updatedAt", label: "Last Updated" },
  { value: "createdAt", label: "Date Created" },
  { value: "title", label: "Title A→Z" },
  { value: "title-desc", label: "Title Z→A" },
];

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
    const [showTrashModal, setShowTrashModal] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const isDark = useSelector((s) => s.theme.mode === "dark");
  const { user } = useSelector((state) => state.auth);
  const { notes, loading } = useSelector((state) => state.notes);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [tags, setTags] = useState([]);
  const [showSort, setShowSort] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [importing, setImporting] = useState(false);
  const hasMounted = useRef(false);
  const importInputRef = useRef(null);

  const fetchActiveNotes = async (search = searchQuery, tag = activeTag, sort = sortBy) => {
    dispatch(setNoteLoading(true));
    try {
      const res = await getNotesService(search, tag, sort);
      dispatch(setNotes(res.data));
    } catch (err) {
      handleApiError(err);
    } finally {
      dispatch(setNoteLoading(false));
    }
  };

  const fetchTags = async () => {
    try {
      const res = await getUserTagsService();
      setTags(res.data || []);
    } catch { /* fail silently */ }
  };

  useEffect(() => { fetchActiveNotes(); fetchTags(); }, []);

  useEffect(() => {
    if (!hasMounted.current) { hasMounted.current = true; return; }
    fetchActiveNotes();
  }, [activeTag, sortBy]);

  useEffect(() => {
    if (!hasMounted.current) return;
    const timer = setTimeout(() => fetchActiveNotes(), searchQuery ? 500 : 0);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["json", "csv"].includes(ext)) {
      toast.error("Only .json and .csv files are supported.");
      return;
    }

    setImporting(true);
    try {
      const text = await file.text();
      let notes = [];

      if (ext === "json") {
        const parsed = JSON.parse(text);
        notes = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.length < 2) {
          toast.error("CSV must have a header row and at least one note.");
          return;
        }
        const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim().toLowerCase());
        const titleIdx = headers.indexOf("title");
        const contentIdx = headers.indexOf("content");
        const tagsIdx = headers.indexOf("tags");

        if (titleIdx === -1) {
          toast.error("CSV must have a 'title' column.");
          return;
        }

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].match(/(".*?"|[^",\n]+)/g) || [];
          const clean = (idx) => (cols[idx] || "").replace(/^"|"$/g, "").trim();
          const title = clean(titleIdx);
          if (!title) continue;
          notes.push({
            title,
            content: contentIdx !== -1 ? clean(contentIdx) : "",
            tags: tagsIdx !== -1
              ? clean(tagsIdx).split(";").map((t) => t.trim()).filter(Boolean)
              : [],
          });
        }
      }

      if (notes.length === 0) {
        toast.error("No valid notes found in the file.");
        return;
      }

      const res = await importNotesService(notes);
      toast.success(res.message);
      await fetchActiveNotes();
      await fetchTags();
    } catch (err) {
      if (err.response) {
        handleApiError(err);
      } else {
        toast.error(err.message || "Failed to parse file. Check the format.");
      }
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async (format) => {
    setShowExport(false);
    try {
      const res = await exportNotesService();
      const allNotes = res.data;

      if (!allNotes || allNotes.length === 0) {
        toast("No notes to export.", { icon: "📭" });
        return;
      }

      let content, mimeType, filename;

      if (format === "json") {
        const exportData = allNotes.map(({ title, content, tags, createdAt, updatedAt }) => ({
          title, content, tags, createdAt, updatedAt,
        }));
        content = JSON.stringify(exportData, null, 2);
        mimeType = "application/json";
        filename = `notes-export-${Date.now()}.json`;
      } else {
        const escape = (val) => `"${String(val || "").replace(/"/g, '""')}"`;
        const header = "title,content,tags";
        const rows = allNotes.map((n) =>
          `${escape(n.title)},${escape(n.content)},${escape((n.tags || []).join(";"))}`
        );
        content = [header, ...rows].join("\n");
        mimeType = "text/csv";
        filename = `notes-export-${Date.now()}.csv`;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${allNotes.length} note${allNotes.length !== 1 ? "s" : ""} exported as ${format.toUpperCase()}.`);
    } catch (err) {
      handleApiError(err);
    }
  };


  const handleTrash = async () => {
    try {
      await trashNoteService(selectedNoteId);

      dispatch(removeNote(selectedNoteId));

      toast.success("Note moved to trash");

      setShowTrashModal(false);
      setSelectedNoteId(null);
    } catch (err) {
      handleApiError(err);
    }
  };


  const bg = isDark ? "bg-slate-900" : "bg-gray-50/50";
  const headingColor = isDark ? "text-white" : "text-slate-900";
  const subColor = isDark ? "text-slate-400" : "text-slate-500";
  const searchBg = isDark
    ? "bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
    : "bg-white border-slate-200 text-slate-900";
  const sortBtnClass = isDark
    ? "flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-600 text-slate-300 bg-slate-800 hover:bg-slate-700 text-sm font-bold transition-all"
    : "flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 shadow-sm text-sm font-bold transition-all";
  const sortDropdown = isDark
    ? "absolute right-0 top-full mt-1 w-44 bg-slate-800 border border-slate-600 rounded-xl shadow-xl z-20 overflow-hidden"
    : "absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden";
  const tagActive = "bg-blue-600 text-white shadow-md shadow-blue-200";
  const tagInactive = isDark
    ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
    : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600";

  return (
    <div className={`min-h-[calc(100vh-64px)] ${bg} pb-20`}>
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className={`text-3xl font-black tracking-tight ${headingColor}`}>
              Welcome back, {user?.name?.split(" ")[0]}!
            </h1>
            <p className={`font-medium mt-1 ${subColor}`}>
              {loading ? "Refreshing notes..." : `You have ${notes.length} active note${notes.length !== 1 ? "s" : ""}.`}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">

            {/* Search */}
            <div className="relative flex-1 md:w-72">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`} size={18} />
              <input type="text" placeholder="Search notes..."
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none transition-all shadow-sm ${searchBg}`}
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            {/* Sort */}
            <div className="relative flex-shrink-0">
              <button onClick={() => setShowSort(!showSort)} className={sortBtnClass}>
                <SlidersHorizontal size={15} />
                <span className="hidden sm:inline">{SORT_OPTIONS.find(o => o.value === sortBy)?.label}</span>
              </button>
              {showSort && (
                <div className={sortDropdown}>
                  {SORT_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${sortBy === opt.value ? "bg-blue-600 text-white" : isDark ? "text-slate-300 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-50"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Hidden file input for import */}
            <input
              ref={importInputRef}
              type="file"
              accept=".json,.csv"
              className="hidden"
              onChange={handleImportFile}
            />

            {/* Import Button */}
            <button
              onClick={() => importInputRef.current?.click()}
              disabled={importing}
              title="Import notes from CSV or JSON"
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-bold transition-all flex-shrink-0 disabled:opacity-50 ${
                isDark
                  ? "border-slate-600 text-slate-300 bg-slate-800 hover:bg-slate-700"
                  : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50 shadow-sm"
              }`}
            >
              <Upload size={15} className={importing ? "animate-bounce" : ""} />
              <span className="hidden sm:inline">{importing ? "Importing..." : "Import"}</span>
            </button>

            {/* Export Dropdown */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowExport(!showExport)}
                title="Export all notes"
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                  isDark
                    ? "border-slate-600 text-slate-300 bg-slate-800 hover:bg-slate-700"
                    : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50 shadow-sm"
                }`}
              >
                <Download size={15} />
                <span className="hidden sm:inline">Export</span>
              </button>
              {showExport && (
                <div className={`absolute right-0 top-full mt-1 w-44 rounded-xl shadow-xl z-20 overflow-hidden ${
                  isDark ? "bg-slate-800 border border-slate-600" : "bg-white border border-slate-200"
                }`}>
                  <button
                    onClick={() => handleExport("json")}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                      isDark ? "text-slate-300 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    📄 Export as JSON
                  </button>
                  <button
                    onClick={() => handleExport("csv")}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                      isDark ? "text-slate-300 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    📊 Export as CSV
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Tag Filter Capsules */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button onClick={() => setActiveTag("")}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeTag === "" ? tagActive : tagInactive}`}>
              All
            </button>
            {tags.map(({ tag, count }) => (
              <button key={tag} onClick={() => setActiveTag(activeTag === tag ? "" : tag)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeTag === tag ? tagActive : tagInactive}`}>
                {tag}
                <span className={`ml-1.5 text-xs ${activeTag === tag ? "opacity-75" : "opacity-50"}`}>{count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Notes Grid */}
        {loading && notes.length === 0 ? (
          <div className={`flex justify-center py-20 italic font-medium ${subColor}`}>Loading your thoughts...</div>
        ) : notes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {notes.map((note) => (
              <NoteCard key={note._id} note={note}
                onNavigate={(id) => navigate(`/notes/${id}`)}
                onAction={(type, id) => {
                  if (type === "trash") {
                    setSelectedNoteId(id);
                    setShowTrashModal(true);
                  }
                }} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isDark ? "bg-slate-800 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
              <FileText size={40} />
            </div>
            <h2 className={`text-2xl font-bold ${headingColor}`}>
              {searchQuery || activeTag ? "No matching notes" : "No notes yet"}
            </h2>
            <p className={`max-w-xs mx-auto mt-2 ${subColor}`}>
              {searchQuery || activeTag ? "Try a different search term or tag filter." : "Click the + button to create your first note!"}
            </p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button onClick={() => navigate("/notes/new")} title="Create New Note"
        className="fixed bottom-10 right-10 w-16 h-16 bg-blue-600 text-white rounded-full shadow shadow-blue-300 hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-50 group">
        <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>
            <ConfirmModal
        isOpen={showTrashModal}
        title="Move Note to Trash?"
        message="This note will be moved to trash. You can restore it later."
        confirmText="Move to Trash"
        confirmColor="red"
        onConfirm={handleTrash}
        onCancel={() => {
          setShowTrashModal(false);
          setSelectedNoteId(null);
        }}
      />
    </div>
  );
};

export default Dashboard;
