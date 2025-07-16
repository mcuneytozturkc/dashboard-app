// ChartType ile enum-like type güvenliği
export type ChartType = "bar" | "pie" | "line" | "area" | "doughnut" | "scatter";

export interface ChartTemplate {
    type: ChartType;
    label: string;
    file: {
        excel: string;
        pdf: string;
    };
}

export const chartTemplates: ChartTemplate[] = [
    {
        type: "bar",
        label: "Bar",
        file: {
            excel: "/templates/excel/bar.xlsx",
            pdf: "/templates/pdf/bar.pdf",
        },
    },
    {
        type: "pie",
        label: "Pie",
        file: {
            excel: "/templates/excel/pie.xlsx",
            pdf: "/templates/pdf/pie.pdf",
        },
    },
    {
        type: "line",
        label: "Line",
        file: {
            excel: "/templates/excel/line.xlsx",
            pdf: "/templates/pdf/line.pdf",
        },
    },
    {
        type: "area",
        label: "Area",
        file: {
            excel: "/templates/excel/area.xlsx",
            pdf: "/templates/pdf/area.pdf",
        },
    },
    {
        type: "doughnut",
        label: "Doughnut",
        file: {
            excel: "/templates/excel/doughnut.xlsx",
            pdf: "/templates/pdf/doughnut.pdf",
        },
    },
    {
        type: "scatter",
        label: "Scatter",
        file: {
            excel: "/templates/excel/scatter.xlsx",
            pdf: "/templates/pdf/scatter.pdf",
        },
    },
];
