import { ChangeEvent, FormEvent, useState } from "react";
import { ApiRequestError } from "../services/api";
import { CreateUserPayload, DEPARTMENTS, FieldErrors, User } from "../types/user";

interface UserFormProps {
  /** When given, the form is in EDIT mode and starts prefilled with this user. */
  user?: User;
  /** Parent performs the API call. If it throws, this form displays the error. */
  onSubmit: (values: CreateUserPayload) => Promise<void>;
  onCancel: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * FRONTEND VALIDATION - instant feedback for the user, saves a pointless network call.
 * It is NOT security: the backend validates again (backend/src/utils/validation.ts) because
 * anybody can bypass this form with cURL.
 */
function validate(values: CreateUserPayload): FieldErrors {
  const errors: FieldErrors = {};
  if (values.name.trim().length < 2) errors.name = "Name is required (min 2 characters).";
  if (!values.email.trim()) errors.email = "Email is required.";
  else if (!EMAIL_REGEX.test(values.email.trim())) errors.email = "Enter a valid email, e.g. rahul@example.com.";
  if (!values.phone.trim()) errors.phone = "Phone number is required.";
  else if (!/^[0-9+\-\s()]{7,15}$/.test(values.phone.trim())) errors.phone = "Phone must be 7-15 digits.";
  if (!values.department) errors.department = "Please choose a department.";
  return errors;
}

/** Add / Edit form. One component, two modes, decided by whether `user` was passed. */
export default function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  // CONTROLLED INPUTS: React state is the single source of truth for what each input shows.
  //  1. input displays  value={values.name}
  //  2. user types -> onChange fires -> we call setValues(...) with the new text
  //  3. state changed -> React re-renders -> the input displays the new state value
  // Initial state is the existing user (edit) or empty strings (add).
  const [values, setValues] = useState<CreateUserPayload>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    department: user?.department ?? "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // One handler for all fields: the input's `name` attribute tells us which key to update.
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value })); // copy old values, replace one key
    setErrors((current) => ({ ...current, [name]: undefined })); // clear that field's error as they type
  };
console.log("Values:", values);
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // stop the browser's default full-page form submit/reload
    if (isSubmitting) return; // guard against double submit

    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return; // invalid: do NOT call the API

    setIsSubmitting(true); // buttons become disabled, label changes to "Saving..."
    setFormError(null);
    try {
      await onSubmit(values); // POST (add) or PATCH (edit) happens in the parent
      // On success the parent closes this modal, so there is nothing more to do here.
    } catch (err) {
      // Show backend problems next to the right field (400 field errors, 409 duplicate email).
      if (err instanceof ApiRequestError) {
        setErrors((err.fieldErrors ?? {}) as FieldErrors);
        setFormError(err.message);
      } else {
        setFormError("Unexpected error. Please try again.");
      }
      setIsSubmitting(false); // allow the user to fix and retry
    }
  };

  // Small helper to avoid repeating the same markup for every field.
  const inputClass = (hasError: boolean) =>
    `mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 disabled:bg-slate-100 ${
      hasError ? "border-red-400 focus:ring-red-300" : "border-slate-300 focus:ring-indigo-300"
    }`;

  return (
    // noValidate: we show our own validation messages instead of the browser's popups.
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>}

      {/* htmlFor/id link the label to the input: clicking the label focuses it, and screen readers read it. */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name</label>
        <input id="name" name="name" type="text" value={values.name} onChange={handleChange} disabled={isSubmitting} placeholder="Enter your name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} className={inputClass(!!errors.name)} />
        {errors.name && <p id="name-error" className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
        <input id="email" name="email" type="email" value={values.email} onChange={handleChange} disabled={isSubmitting} placeholder="rahul@example.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} className={inputClass(!!errors.email)} />
        {errors.email && <p id="email-error" className="mt-1 text-xs text-red-600">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Phone number</label>
        <input id="phone" name="phone" type="tel" value={values.phone} onChange={handleChange} disabled={isSubmitting} placeholder="9876543210" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "phone-error" : undefined} className={inputClass(!!errors.phone)} />
        {errors.phone && <p id="phone-error" className="mt-1 text-xs text-red-600">{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="department" className="block text-sm font-medium text-slate-700">Department</label>
        <select id="department" name="department" value={values.department} onChange={handleChange} disabled={isSubmitting} aria-invalid={!!errors.department} aria-describedby={errors.department ? "department-error" : undefined} className={inputClass(!!errors.department)}>
          <option value="">Select a department</option>
          {/* Edit mode: keep a legacy department visible even if it is not in our default list. */}
          {user && !DEPARTMENTS.includes(user.department as (typeof DEPARTMENTS)[number]) && <option value={user.department}>{user.department}</option>}
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        {errors.department && <p id="department-error" className="mt-1 text-xs text-red-600">{errors.department}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? "Saving..." : user ? "Save changes" : "Add user"}
        </button>
      </div>
    </form>
  );
}
