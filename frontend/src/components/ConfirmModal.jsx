import { useSelector } from "react-redux";

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "red",
  onConfirm,
  onCancel,
}) => {
  const isDark = useSelector((state) => state.theme?.mode === "dark");

  if (!isOpen) return null;

  const modalBg = isDark
    ? "bg-slate-800 border border-slate-700"
    : "bg-white";

  const titleColor = isDark
    ? "text-white"
    : "text-slate-900";

  const messageColor = isDark
    ? "text-slate-400"
    : "text-slate-500";

  const cancelBtn = isDark
    ? "text-slate-300 hover:bg-slate-700"
    : "text-slate-500 hover:bg-slate-100";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div
        className={`w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200 ${modalBg}`}
      >
        <h2 className={`text-2xl font-black mb-3 ${titleColor}`}>
          {title}
        </h2>

        <p className={`leading-relaxed mb-8 ${messageColor}`}>
          {message}
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className={`px-5 py-2.5 rounded-xl font-bold transition ${cancelBtn}`}
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl font-bold text-white transition ${
              confirmColor === "red"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;