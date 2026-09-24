import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

function Notification({
  message,
  type = "info",
  onClose,
}) {
  const styles = {
    success: "bg-green-50 text-green-700 border-green-200",
    error: "bg-red-50 text-red-700 border-red-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
  };

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  };

  const Icon = icons[type] || Info;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${styles[type] || styles.info}`}
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