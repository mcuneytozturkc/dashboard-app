import { useState } from "react";
import { useTranslation } from "react-i18next";
import { sendContactForm } from "../services/contact.service";

interface FormState {
  name: string;
  email: string;
  type: string;
  message: string;
  honeypot: string;
}

function validate(form: FormState, t: (k: string) => string) {
  const errors: Partial<Record<keyof FormState, string>> = {};
  if (form.name.trim().length < 2) errors.name = t("name_too_short");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = t("email_invalid");
  if (form.message.trim().length < 10) errors.message = t("message_too_short");
  return errors;
}

export default function ContactPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>({ name: "", email: "", type: "request", message: "", honeypot: "" });
  const [status, setStatus] = useState<null | "success" | "error" | "sending">(null);
  const [submitted, setSubmitted] = useState(false);

  const errors = submitted ? validate(form, t) : {};
  const isValid = Object.keys(validate(form, t)).length === 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (status) setStatus(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (form.honeypot) return; // spam bot
    if (!isValid) return;

    setStatus("sending");
    try {
      await sendContactForm({ name: form.name, email: form.email, type: form.type, message: form.message });
      setStatus("success");
      setForm({ name: "", email: "", type: "request", message: "", honeypot: "" });
      setSubmitted(false);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] items-center justify-center
      bg-gradient-to-br from-indigo-100 to-white
      dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
      <section className="w-full max-w-lg mx-auto p-6 mt-12
        bg-white dark:bg-gray-900 rounded-xl shadow-lg transition-colors">
        <h1 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-2">{t("contact")}</h1>
        <p className="mb-5 text-gray-500 dark:text-gray-300">{t("contact_description")}</p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Honeypot — hidden from real users */}
          <input
            type="text"
            name="honeypot"
            value={form.honeypot}
            onChange={handleChange}
            autoComplete="off"
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
          />

          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200" htmlFor="name">
              {t("your_name")}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              autoComplete="off"
              className={`w-full px-3 py-2 border rounded bg-white dark:bg-gray-800
                border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-indigo-500 transition-colors
                ${errors.name ? "border-red-400 dark:border-red-500" : ""}`}
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200" htmlFor="email">
              {t("your_email")}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`w-full px-3 py-2 border rounded bg-white dark:bg-gray-800
                border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-indigo-500 transition-colors
                ${errors.email ? "border-red-400 dark:border-red-500" : ""}`}
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200" htmlFor="type">
              {t("message_type")}
            </label>
            <select
              id="type"
              name="type"
              className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-800
                border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-indigo-500 transition-colors"
              value={form.type}
              onChange={handleChange}
            >
              <option value="request">{t("request")}</option>
              <option value="suggestion">{t("suggestion")}</option>
              <option value="complaint">{t("complaint")}</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200" htmlFor="message">
              {t("your_message")}
            </label>
            <textarea
              id="message"
              name="message"
              className={`w-full px-3 py-2 border rounded bg-white dark:bg-gray-800
                border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-indigo-500 transition-colors
                ${errors.message ? "border-red-400 dark:border-red-500" : ""}`}
              rows={4}
              value={form.message}
              onChange={handleChange}
            />
            {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700
              text-white font-semibold rounded transition disabled:opacity-60"
          >
            {status === "sending" ? t("sending") : t("send")}
          </button>

          {status === "success" && (
            <div className="text-green-600 dark:text-green-400 mt-2">{t("message_success")}</div>
          )}
          {status === "error" && (
            <div className="text-red-500 mt-2">{t("message_error")}</div>
          )}
        </form>
      </section>
    </div>
  );
}
