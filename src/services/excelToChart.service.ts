import * as XLSX from "xlsx";
import type { ChartType } from "../model/ChartTemplate";

// Hataları detaylı gösteren, esnek Excel okuma fonksiyonu
export async function parseExcelToChartData(
    file: File,
    chartType: ChartType
): Promise<any> {
    // Okuma fonksiyonunu seç (arrayBuffer ya da binaryString)
    const tryParse = (
        readerType: "arraybuffer" | "binarystring"
    ): Promise<any> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                let data = e.target?.result;
                if (!data) {
                    reject("Dosya okunamadı.");
                    return;
                }

                try {
                    // read tipine göre XLSX ayarı
                    let workbook;
                    if (readerType === "arraybuffer") {
                        workbook = XLSX.read(data, { type: "array" });
                    } else {
                        workbook = XLSX.read(data, { type: "binary" });
                    }

                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(sheet);

                    if (!Array.isArray(jsonData) || jsonData.length === 0) {
                        reject("Excel'de veri bulunamadı. İlk satırda başlıklar olduğuna emin olun.");
                        return;
                    }

                    // Ortak başlıkları yakala (BÜYÜK/KÜÇÜK harfe duyarlı olmasın)
                    const firstRow = jsonData[0] as Record<string, any>;
                    const keys = Object.keys(firstRow).map((k) => k.toLowerCase());

                    // Bar, Line, Pie için
                    if (["bar", "line", "pie", "area", "doughnut"].includes(chartType)) {
                        const catKey = Object.keys(firstRow).find(
                            (k) => k.toLowerCase() === "category"
                        );
                        const valKey = Object.keys(firstRow).find(
                            (k) => k.toLowerCase() === "value"
                        );
                        if (!catKey || !valKey) {
                            reject(
                                'Excel formatı hatalı: Başlıklarınızda "Category" ve "Value" sütunları olmalı. (Büyük/küçük harf duyarlı değildir.)'
                            );
                            return;
                        }
                        resolve({
                            labels: jsonData.map((row: any) => row[catKey]),
                            datasets: [
                                {
                                    label: "Excel Data",
                                    data: jsonData.map((row: any) => Number(row[valKey])),
                                    backgroundColor: "#6366f1",
                                },
                            ],
                        });
                        return;
                    }

                    // Scatter için
                    if (chartType === "scatter") {
                        const xKey = Object.keys(firstRow).find(
                            (k) => k.toLowerCase() === "x"
                        );
                        const yKey = Object.keys(firstRow).find(
                            (k) => k.toLowerCase() === "y"
                        );
                        if (!xKey || !yKey) {
                            reject(
                                'Scatter için "X" ve "Y" başlıkları olmalı. (Büyük/küçük harf duyarlı değildir.)'
                            );
                            return;
                        }
                        resolve({
                            labels: [],
                            datasets: [
                                {
                                    label: "Scatter Data",
                                    data: jsonData.map((row: any) => ({
                                        x: Number(row[xKey]),
                                        y: Number(row[yKey]),
                                    })),
                                    backgroundColor: "#34d399",
                                },
                            ],
                        });
                        return;
                    }

                    // Diğer chart tipleri için ek kod ekleyebilirsin...

                    reject("Seçilen grafik tipi desteklenmiyor veya örnek şablon eksik!");
                } catch (err: any) {
                    reject(
                        "Excel okuma hatası! Dosya bozuk olabilir veya yanlış formatta. Hata detayı: " +
                        (err?.message || String(err))
                    );
                }
            };

            reader.onerror = () => {
                reject("Dosya okuma hatası! Dosyanın bozuk olmadığından ve bir Excel dosyası olduğundan emin olun.");
            };

            // Okuma tipine göre farklı oku
            if (readerType === "arraybuffer") {
                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsBinaryString(file);
            }
        });

    // Önce arraybuffer ile dene, hata olursa binarystring ile tekrar dene
    try {
        return await tryParse("arraybuffer");
    } catch (e1) {
        try {
            return await tryParse("binarystring");
        } catch (e2) {
            throw (
                "Excel dosyası okunamadı! Yüklediğiniz dosya gerçekten bir Excel dosyası mı kontrol edin. " +
                "Hata 1: " +
                e1 +
                " | Hata 2: " +
                e2
            );
        }
    }
}
