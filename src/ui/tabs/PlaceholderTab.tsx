import React from "react";

interface PlaceholderTabProps {
    title: string;
    icon: string;
    description: string;
    features: string[];
}

export const PlaceholderTab: React.FC<PlaceholderTabProps> = ({
    title,
    icon,
    description,
    features
}) => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-slate-900/80 border border-amber-500/30 shadow-2xl mb-6 relative">
                <span className="text-5xl animate-bounce">{icon}</span>
                <div className="absolute inset-0 rounded-3xl bg-amber-400/10 blur-xl pointer-events-none" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 mb-2">
                {title}
            </h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
                {description}
            </p>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 text-left max-w-md mx-auto shadow-xl">
                <h3 className="text-xs font-semibold text-amber-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span>⚡</span>
                    <span>Tính Năng Đang Luyện Chế (Sắp Ra Mắt):</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                    {features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>{feat}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
