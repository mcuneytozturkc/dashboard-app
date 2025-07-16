import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function ContactPage() {
    const { t } = useTranslation();
    const [form, setForm] = useState({ name: "", email: "", type: "request", message: "" });
    const [status, setStatus] = useState<null | "success" | "error">(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setStatus(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Burada backend'e gönderim yapılabilir
        setTimeout(() => setStatus("success"), 800); // Demo için sahte onay
        setForm({ name: "", email: "", type: "request", message: "" });
    };

    return (
        <div className="
            flex flex-col min-h-[calc(100vh-4rem)] items-center justify-center
            bg-gradient-to-br from-indigo-100 to-white
            dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800
        ">
            <section className="w-full max-w-lg mx-auto p-6 mt-12 
            bg-white dark:bg-gray-900 
            rounded-xl shadow-lg 
            transition-colors">
                <h1 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-2">{t("contact")}</h1>
                <p className="mb-5 text-gray-500 dark:text-gray-300">
                    {t("contact_description") || "İstek, öneri veya şikayetlerinizi bu formdan iletebilirsiniz."}
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200" htmlFor="name">
                            {t("your_name") || "Adınız"}
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            autoComplete="off"
                            className="w-full px-3 py-2 border rounded 
                            bg-white dark:bg-gray-800 
                            border-gray-300 dark:border-gray-700 
                            text-gray-900 dark:text-gray-100 
                            focus:ring-2 focus:ring-indigo-500 transition-colors"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200" htmlFor="email">
                            {t("your_email") || "E-posta"}
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="w-full px-3 py-2 border rounded 
                            bg-white dark:bg-gray-800 
                            border-gray-300 dark:border-gray-700 
                            text-gray-900 dark:text-gray-100 
                            focus:ring-2 focus:ring-indigo-500 transition-colors"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200" htmlFor="type">
                            {t("message_type") || "Mesaj Türü"}
                        </label>
                        <select
                            id="type"
                            name="type"
                            className="w-full px-3 py-2 border rounded 
                            bg-white dark:bg-gray-800 
                            border-gray-300 dark:border-gray-700 
                            text-gray-900 dark:text-gray-100 
                            focus:ring-2 focus:ring-indigo-500 transition-colors"
                            value={form.type}
                            onChange={handleChange}
                        >
                            <option value="request">{t("request") || "İstek"}</option>
                            <option value="suggestion">{t("suggestion") || "Öneri"}</option>
                            <option value="complaint">{t("complaint") || "Şikayet"}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200" htmlFor="message">
                            {t("your_message") || "Mesajınız"}
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            className="w-full px-3 py-2 border rounded 
                            bg-white dark:bg-gray-800 
                            border-gray-300 dark:border-gray-700 
                            text-gray-900 dark:text-gray-100 
                            focus:ring-2 focus:ring-indigo-500 transition-colors"
                            rows={4}
                            value={form.message}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 
                        bg-indigo-600 hover:bg-indigo-700 
                        text-white font-semibold rounded transition"
                    >
                        {t("send") || "Gönder"}
                    </button>
                    {status === "success" && (
                        <div className="text-green-600 dark:text-green-400 mt-2">
                            {t("message_success") || "Mesajınız başarıyla iletildi!"}
                        </div>
                    )}
                    {status === "error" && (
                        <div className="text-red-500 mt-2">
                            {t("message_error") || "Bir hata oluştu. Lütfen tekrar deneyin."}
                        </div>
                    )}
                </form>
            </section>
        </div>
    );
}
