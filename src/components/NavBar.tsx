import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

type NavbarProps = {
    darkMode: boolean;
    setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Navbar({ darkMode, setDarkMode }: NavbarProps) {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const links = [
        { name: t("home"), path: "/" },
        { name: t("excel"), path: "/excel" },
        { name: t("pdf"), path: "/pdf" },
        { name: t("contact"), path: "/contact" }
    ];
    const [hovered, setHovered] = useState<"chart" | "maker" | null>(null);

    return (
        <header className="w-full bg-white dark:bg-gray-900 shadow-md dark:shadow-lg transition-colors">
            <nav className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
                {/* Logo veya Başlık */}
                <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
                    <span
                        className={`transition-colors cursor-pointer ${hovered === "chart"
                            ? "text-indigo-400"
                            : "text-indigo-600 dark:text-indigo-400"
                            }`}
                        onMouseEnter={() => setHovered("chart")}
                        onMouseLeave={() => setHovered(null)}
                    >
                        Chart
                    </span>
                    <span
                        className={`transition-colors cursor-pointer ${hovered === "maker"
                            ? "text-emerald-600"
                            : "text-emerald-500 dark:text-emerald-400"
                            }`}
                        onMouseEnter={() => setHovered("maker")}
                        onMouseLeave={() => setHovered(null)}
                    >
                        Maker
                    </span>
                </Link>
                <div className="flex items-center gap-6">
                    {links.map(link => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`font-medium transition-colors
                                    ${link.path === '/pdf'
                                    ? (location.pathname === '/pdf'
                                        ? "text-emerald-600 dark:text-emerald-400 underline"
                                        : "text-gray-800 hover:text-emerald-500 dark:text-gray-200 dark:hover:text-emerald-400")
                                    : (location.pathname === link.path
                                        ? "text-indigo-600 dark:text-indigo-400 underline"
                                        : "text-gray-800 hover:text-indigo-500 dark:text-gray-200 dark:hover:text-indigo-400")
                                }
        `}
                        >
                            {link.name}
                        </Link>
                    ))}

                    {/* Dil seçici */}
                    <select
                        className="ml-2 py-1 px-2 rounded bg-indigo-600 text-white font-semibold dark:bg-indigo-700"
                        value={i18n.language}
                        onChange={e => i18n.changeLanguage(e.target.value)}
                    >
                        <option value="en">EN</option>
                        <option value="tr">TR</option>
                    </select>
                    <button
                        onClick={() => setDarkMode((d: boolean) => !d)}
                        className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition"
                        title={darkMode ? "Açık Moda Geç" : "Koyu Moda Geç"}
                    >
                        {darkMode ? "🌙" : "☀️"}
                    </button>

                </div>
            </nav>
        </header>
    );
}

