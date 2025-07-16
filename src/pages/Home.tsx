import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
    const { t } = useTranslation();
    const [hovered, setHovered] = useState<"chart" | "maker" | null>(null);

    return (
        <main className="
            flex flex-col min-h-[calc(100vh-4rem)] items-center justify-center
            bg-gradient-to-br from-indigo-100 to-white
            dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800
        ">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 flex gap-2 select-none">
                <span
                    className={`
                        transition-colors cursor-pointer
                        ${hovered === "chart"
                            ? "text-indigo-400"
                            : "text-indigo-600 dark:text-indigo-300"}
                    `}
                    onMouseEnter={() => setHovered("chart")}
                    onMouseLeave={() => setHovered(null)}
                >
                    Chart
                </span>
                <span
                    className={`
                        transition-colors cursor-pointer
                        ${hovered === "maker"
                            ? "text-emerald-600"
                            : "text-emerald-500 dark:text-emerald-300"}
                    `}
                    onMouseEnter={() => setHovered("maker")}
                    onMouseLeave={() => setHovered(null)}
                >
                    Maker
                </span>
            </h1>
            <p className="max-w-2xl text-lg md:text-xl text-gray-700 dark:text-gray-200 text-center mb-8">
                {t("description")}
            </p>
            <div className="flex gap-4">
                <Link
                    to="/excel"
                    className="px-6 py-3 rounded bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-400 dark:bg-indigo-500 dark:hover:bg-indigo-700 transition"
                >
                    {t("excel_upload")}
                </Link>
                <Link
                    to="/pdf"
                    className="px-6 py-3 rounded bg-emerald-500 text-white font-semibold shadow hover:bg-emerald-600 dark:bg-emerald-700 dark:hover:bg-emerald-900 transition"
                >
                    {t("pdf_upload")}
                </Link>
            </div>
        </main>
    );
}
