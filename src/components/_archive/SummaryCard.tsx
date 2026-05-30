export default function SummaryCard({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="bg-indigo-600 text-white rounded-lg p-4 shadow w-full text-center">
            <p className="text-sm uppercase tracking-wide">{label}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
        </div>
    );
}
