import { Edit3, Trash2, RotateCcw, Trash, Clock, Tag } from "lucide-react";
import DOMPurify from "dompurify";
import { useSelector } from "react-redux";

const NoteCard = ({ note, isTrash = false, onAction, onNavigate }) => {
  const isDark = useSelector((s) => s.theme.mode === "dark");

  const cardClass = isDark
    ? `group relative bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm transition-all ${!isTrash ? "hover:shadow-xl hover:border-blue-700 cursor-pointer" : ""}`
    : `group relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all ${!isTrash ? "hover:shadow-xl hover:shadow-blue-100/50 hover:border-blue-200 cursor-pointer" : ""}`;

  return (
    <div onClick={() => !isTrash && onNavigate(note._id)} className={cardClass}>
      {/* Actions */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        {isTrash ? (
          <>
            <button onClick={(e) => { e.stopPropagation(); onAction("restore", note._id); }}
              className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors" title="Restore Note">
              <RotateCcw size={16} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onAction("permanent", note._id); }}
              className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Delete Permanently">
              <Trash size={16} />
            </button>
          </>
        ) : (
          <>
            <button onClick={(e) => { e.stopPropagation(); onNavigate(note._id); }}
              className={`p-2 rounded-lg transition-colors ${isDark ? "bg-slate-700 text-slate-400 hover:text-blue-400" : "bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50"}`}>
              <Edit3 size={16} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onAction("trash", note._id); }}
              className={`p-2 rounded-lg transition-colors ${isDark ? "bg-slate-700 text-slate-400 hover:text-red-400" : "bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50"}`}>
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>

      <h3 className={`text-lg font-bold mb-3 pr-14 truncate ${isDark ? "text-slate-100" : "text-slate-800"}`}>
        {note.title}
      </h3>

      <div className={`text-sm line-clamp-4 prose mb-3 ${isDark ? "text-slate-400 prose-invert" : "text-slate-500 prose-slate"}`}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.content) }} />

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.slice(0, 3).map((tag) => (
            <span key={tag} className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${isDark ? "bg-blue-900/40 text-blue-300" : "bg-blue-50 text-blue-600"}`}>
              <Tag size={9} /> {tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-400"}`}>
              +{note.tags.length - 3}
            </span>
          )}
        </div>
      )}

      <div className={`mt-auto pt-4 border-t flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${isDark ? "border-slate-700 text-slate-500" : "border-slate-50 text-slate-400"}`}>
        <Clock size={12} />
        {isTrash ? `Deleted: ${new Date(note.deletedAt).toLocaleDateString()}` : `Updated: ${new Date(note.updatedAt).toLocaleDateString()}`}
      </div>
    </div>
  );
};

export default NoteCard;
