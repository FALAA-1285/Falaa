import React from "react";

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function Field({ label, htmlFor, hint, error, optional, className, children }: FieldProps) {
  return (
    <div className={`adm-field ${className ?? ""}`}>
      <label htmlFor={htmlFor} className="adm-label">
        {label}
        {optional && <span className="adm-faint font-normal"> (opsional)</span>}
      </label>
      {children}
      {error ? <p className="adm-error">{error}</p> : hint && <p className="adm-hint">{hint}</p>}
    </div>
  );
}
