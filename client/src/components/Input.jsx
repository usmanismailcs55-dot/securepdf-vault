function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder = "",
  disabled = false,
  required = false,
  className = "",
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={name} className="text-label">
          {label}
        </label>
      )}

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full rounded-md border border-black bg-white px-3 py-2 text-sm text-black outline-none transition placeholder:text-black focus:border-black focus:ring-2 focus:ring-black disabled:cursor-not-allowed disabled:bg-white ${className}`}
      />
    </div>
  );
}

export default Input;
