import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: ReactNode;
}

/** حقل نصي بعنوان علوي */
export function Field({ label, hint, id, ...props }: FieldProps) {
  const fieldId = id ?? `f-${label}`;
  return (
    <label className="field" htmlFor={fieldId}>
      <span>{label}</span>
      <input id={fieldId} {...props} />
      {hint}
    </label>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: ReactNode;
}

/** حقل اختيار بعنوان علوي */
export function SelectField({ label, children, id, ...props }: SelectFieldProps) {
  const fieldId = id ?? `f-${label}`;
  return (
    <label className="field" htmlFor={fieldId}>
      <span>{label}</span>
      <select id={fieldId} {...props}>
        {children}
      </select>
    </label>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

/** حقل نص متعدد الأسطر بعنوان علوي */
export function TextAreaField({ label, id, ...props }: TextAreaFieldProps) {
  const fieldId = id ?? `f-${label}`;
  return (
    <label className="field" htmlFor={fieldId}>
      <span>{label}</span>
      <textarea id={fieldId} {...props} />
    </label>
  );
}
