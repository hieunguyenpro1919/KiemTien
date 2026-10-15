import React, { useState } from "react";
import { Header } from "./ui/layouts/Header";
import { Navigation, NavTabId } from "./ui/layouts/Navigation";
import { CultivateTab } from "./ui/tabs/CultivateTab";
import { CombatTab } from "./ui/tabs/CombatTab";
import { PlaceholderTab } from "./ui/tabs/PlaceholderTab";
import { useGameLoop } from "./core/state/useGameLoop";
import { formatBigNumber } from "./core/utils/format";
import { ErrorBoundary } from "./ui/components/ErrorBoundary";

export const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<NavTabId>("cultivate");

    // Kích hoạt Vòng Lặp Game AFK & Lắng nghe báo cáo Offline
    const { offlineReport, clearOfflineReport } = useGameLoop();

    return (
        <div className="min-h-screen bg-[#05070d] text-slate-100 flex flex-col font-sans select-none overflow-x-hidden relative">
            {/* Ambient Background Glows */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />

            {/* Header Ghim Cố Định */}
            <Header />

            {/* Thanh Điều Hướng 7 Tab */}
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Khung Nội Dung Chính */}
            <main className="flex-1 w-full pb-16 relative z-10">
                <ErrorBoundary fallbackTitle="Nội Dung Giao Diện Tạm Gián Đoạn">
                    {activeTab === "cultivate" && <CultivateTab />}
                    {activeTab === "combat" && <CombatTab />}
                </ErrorBoundary>

                {activeTab === "tower" && (
                    <PlaceholderTab
                        title="Hư Không Tháp Vô Tận"
                        icon="🗼"
                        description="Khiêu chiến vô tận tầng không giới hạn. Leo càng cao linh thạch và tu vi càng tăng theo cấp số nhân."
                        features={[
                            "Thuật toán sinh quái động vô tận tầng",
                            "Đồng hồ Cuồng Nộ 60s (Enrage Timer)",
                            "Tính năng Quét Tháp (Sweep) 1-chạm",
                            "Thưởng Vé Tầm Đạo mỗi 50 tầng"
                        ]}
                    />
                )}

                {activeTab === "pets" && (
                    <PlaceholderTab
                        title="Tam Đại Thần Thú Thượng Cổ"
                        icon="🐾"
                        description="Thuần dưỡng 3 Linh Thú tối thượng đồng hành trong mọi trận chiến sinh tử."
                        features={[
                            "Bắc Hải Huyền Vũ: Đỡ đòn, phản sát thương, tạo khiên 200% HP",
                            "Cửu U Ma Long: 100% Sát thương chuẩn, đoạt % Máu Boss",
                            "Cửu Thiên Phượng Hoàng: Tăng x2 tổng sát thương, cuồng nộ 10x tốc đánh",
                            "Thần thông 12 cấp độ nuôi dưỡng bằng đan dược"
                        ]}
                    />
                )}

                {activeTab === "inventory" && (
                    <PlaceholderTab
                        title="Hành Trang & Trang Bị"
                        icon="🎒"
                        description="Quản lý túi đồ đạo gia, đan dược hộ thể và các bộ trang bị 7 phẩm cấp tối thượng."
                        features={[
                            "Bộ lọc thông minh: Trang bị, Đan dược, Vật phẩm",
                            "3 Ô trang bị: Nón, Áo Giáp, Vũ Khí",
                            "Tính năng Bán Nhanh Đồ Trùng giữ lại trang bị mạnh nhất",
                            "Cắn đan dược hàng loạt tăng nhanh tu vi"
                        ]}
                    />
                )}

                {activeTab === "gacha" && (
                    <PlaceholderTab
                        title="Đài Cầu Đạo"
                        icon="🔮"
                        description="Khai mở cơ duyên, quay tầm đạo để lĩnh ngộ 6 Đại Thần Thông trấn thân và thuần phục Thần Thú."
                        features={[
                            "6 Đại Thần Thông trấn thân kích hoạt bằng Nộ Khí",
                            "Cơ chế bảo hiểm kép: 100 lần ra Thánh Cấp, 500 lần ra Thần Cấp",
                            "Rút trùng tự động phân giải thành Mảnh Cơ Duyên",
                            "Hiệu ứng mở thẻ hoàng kim rực rỡ"
                        ]}
                    />
                )}

                {activeTab === "shop" && (
                    <PlaceholderTab
                        title="Bách Bảo Các"
                        icon="🏪"
                        description="Cửa tiệm đan dược thượng phẩm và sàn giao dịch quy đổi tiền tệ 2 chiều."
                        features={[
                            "Tiệm Đan Dược từ Tôi Khí đến Đại Đạo Khởi Nguyên Đan",
                            "Nút Mua Hết Đan Dược tiện lợi",
                            "Quy đổi 2 chiều: Linh Thạch 💎 <-> Hỗn Nguyên Thạch 🌀",
                            "Tính năng Nén Toàn Bộ Linh Thạch 1-chạm"
                        ]}
                    />
                )}
            </main>

            {/* Modal Thông Báo Tích Lũy Offline Khi Đạo Hữu Quay Lại */}
            {offlineReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                    <div className="max-w-md w-full bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-400/50 rounded-2xl p-6 shadow-2xl shadow-amber-500/20 text-center relative overflow-hidden">
                        <div className="text-4xl mb-2">🧘‍♂️</div>
                        <h3 className="text-xl font-bold font-serif text-amber-300 tracking-wide mb-1">
                            BẾ QUAN TU LUYỆN HOÀN TẤT
                        </h3>
                        <p className="text-xs text-slate-400 mb-6">
                            Đạo hữu đã vắng mặt bế quan trong{" "}
                            <span className="text-amber-400 font-semibold">{offlineReport.formattedTime}</span>.
                        </p>

                        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 mb-6">
                            <span className="text-xs text-slate-400 block mb-1">Tu Vi Thu Nhận Được:</span>
                            <span className="text-2xl font-bold font-mono text-emerald-400">
                                +{formatBigNumber(offlineReport.tuViGained)} Tu Vi
                            </span>
                        </div>

                        <button
                            onClick={clearOfflineReport}
                            className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold font-serif rounded-xl shadow-lg shadow-amber-500/30 transition-all cursor-pointer active:scale-95"
                        >
                            Thu Nhận & Xuất Quan
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
