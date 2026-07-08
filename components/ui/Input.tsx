import React, { forwardRef } from "react";

export const inputClasses =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className = "", ...props }, ref) => (
  <input ref={ref} className={`${inputClasses} ${className}`} {...props} />
));

Input.displayName = "Input";

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className = "", children, ...props }, ref) => (
  <select ref={ref} className={`${inputClasses} ${className}`} {...props}>
    {children}
  </select>
));

Select.displayName = "Select";

export const Checkbox = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label?: React.ReactNode }
>(({ className = "", label, children, ...props }, ref) => (
  <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
    <input
      ref={ref}
      type="checkbox"
      className={`h-4 w-4 rounded border-zinc-300 text-zinc-900 accent-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:accent-zinc-100 ${className}`}
      {...props}
    />
    <span className="inline-flex items-center">{label ?? children}</span>
  </label>
));

Checkbox.displayName = "Checkbox";

export const FormLabel: React.FunctionComponent<
  React.LabelHTMLAttributes<HTMLLabelElement>
> = ({ className = "", children, ...props }) => (
  <label
    className={`mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300 ${className}`}
    {...props}
  >
    {children}
  </label>
);

export const FormErrorMessage: React.FunctionComponent<{
  children: React.ReactNode;
}> = ({ children }) => (
  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{children}</p>
);
