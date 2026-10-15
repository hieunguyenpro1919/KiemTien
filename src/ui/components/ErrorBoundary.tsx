import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallbackTitle?: string;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="max-w-xl mx-auto my-12 p-6 rounded-2xl bg-slate-950/90 border-2 border-amber-500/40 shadow-2xl text-center space-y-4">
                    <div className="text-4xl">⚠️</div>
                    <h3 className="text-xl font-bold font-serif text-amber-300">
                        {this.props.fallbackTitle || "Linh Trận Tạm Thời Bị Gián Đoạn"}
                    </h3>
                    <p className="text-xs text-slate-300">
                        Hệ thống đồ họa WebGL hoặc linh trận gặp sự cố bất thường:
                    </p>
                    <div className="p-3 rounded-lg bg-black/60 border border-red-500/30 text-rose-300 text-xs font-mono text-left overflow-x-auto max-h-32">
                        {this.state.error?.message || "Lỗi không xác định"}
                    </div>
                    <div className="flex justify-center gap-3 pt-2">
                        <button
                            onClick={this.handleReset}
                            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs font-serif transition shadow-lg cursor-pointer"
                        >
                            🔄 Khởi Tạo Lại Linh Trận
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
