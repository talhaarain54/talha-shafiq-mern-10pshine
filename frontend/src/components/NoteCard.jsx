import { Edit3, Trash2, RotateCcw, Trash, Clock } from "lucide-react";
import DOMPurify from "dompurify";

const NoteCard = ({ note, isTrash = false, onAction, onNavigate }) => {
  return (
    <div
      onClick={() => !isTrash && onNavigate(note._id)}
      className={`group relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all ${
        !isTrash
          ? "hover:shadow-xl hover:shadow-blue-100/50 hover:border-blue-200 cursor-pointer"
          : ""
      }`}
    >
      {/* Dynamic Actions Overlay */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        {isTrash ? (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction("restore", note._id);
              }}
              className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
              title="Restore Note"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction("permanent", note._id);
              }}
              className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title="Delete Permanently"
            >
              <Trash size={16} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(note._id);
              }}
              className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction("trash", note._id);
              }}
              className="p-2 bg-slate-50 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>

      <h3 className="text-lg font-bold text-slate-800 mb-3 pr-14 truncate">
        {note.title}
      </h3>

      <div
        className="text-slate-500 text-sm line-clamp-4 prose prose-slate mb-4"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.content) }}
      />

      <div className="mt-auto pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <Clock size={12} />
        {isTrash
          ? `Deleted: ${new Date(note.deletedAt).toLocaleDateString()}`
          : `Updated: ${new Date(note.updatedAt).toLocaleDateString()}`}
      </div>
    </div>
  );
};

export default NoteCard;
