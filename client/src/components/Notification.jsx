import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

function Notification({
  message,
  type = "info",
  onClose,
}) {
  const styles = {
    success: "bg-white text-black border-black",
    error: "bg-white text-black border-black",
    info: "bg-white text-black border-black",
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
      <Icon
        size={20}
        className="text-black"
      />

      <p className="flex-1 text-sm text-black">
        {message}
      </p>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-black bg-white p-1 text-black transition hover:bg-black hover:text-white"
          aria-label="Close notification"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

export default Notification;
