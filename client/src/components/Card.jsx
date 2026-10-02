import { forwardRef } from "react";

const Card = forwardRef(function Card(
  { children, className = "" },
  ref
) {
  return (
    <div
      ref={ref}
      className={`rounded-xl border border-black/10 bg-white p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
});

export default Card;