function Button({
  children,
  type = "button",
  onClick,
  disabled = false,
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`text-button btn-primary ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;