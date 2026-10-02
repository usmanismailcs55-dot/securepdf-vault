import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

function Notification({
  message,
  type = "info",
  onClose,
}) {
  const styles = {
    success: "bg-black/[0.03] text-black/80 border-black/15",
    error: "bg-black/[0.04] text-black/85 border-black/20",
    info: "bg-black/[0.02] text-black/75 border-black/10",
  };

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  };

  const Icon = icons[type] || Info;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
        styles[type] || styles.info
      }`}
      role="alert"
    >
      <Icon size={20} />

      <p className="flex-1 text-sm">
        {message}
      </p>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 hover:bg-black/5"
          aria-label="Close notification"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

export default Notification;