import { useState } from "react";
// You can use a chart library like recharts, chart.js, or just a placeholder SVG for the line chart

function InsightPage() {
  // Example data
  const [trend, setTrend] = useState("weekly");
  const chartData = [
    { date: "21-05-2025", value: 10000 },
    { date: "22-05-2025", value: 50000 },
    { date: "23-05-2025", value: 40000 },
    { date: "24-05-2025", value: 80000 },
    { date: "25-05-2025", value: 120000 },
    { date: "26-05-2025", value: 110000 },
    { date: "27-05-2025", value: 130000 },
    { date: "28-05-2025", value: 150000 },
    { date: "29-05-2025", value: 60000 },
    { date: "Now", value: 40000 },
  ];

  return (
    <div className="min-h-screen pb-5">
      <h1 className="text-white text-2xl font-bold mb-1">Page Views</h1>
      <p className="text-[#a2a2a2] mb-6">See Recent views of the page.</p>

      {/* Visitor Trend Card */}
      <div className="bg-[#181818] rounded-2xl p-6 mb-6 shadow-lg border border-[#232323]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-white text-lg font-bold">Visitor Trend</span>
            <span className="ml-2 bg-green-900 text-green-300 px-2 py-1 rounded-full text-xs font-semibold">↑ 75%</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-[#232323] text-white px-3 py-1 rounded-lg text-xs font-medium">Weekly</button>
            <button className="bg-transparent text-[#a2a2a2] px-3 py-1 rounded-lg text-xs font-medium">▼</button>
          </div>
        </div>
        {/* Chart Placeholder */}
        <div className="w-full h-56 flex items-center justify-center">
          {/* Replace with a real chart in production */}
          <svg width="100%" height="100%" viewBox="0 0 700 200">
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6fffc6" />
                <stop offset="100%" stopColor="#232323" />
              </linearGradient>
            </defs>
            <polyline
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="3"
              points="0,180 70,150 140,160 210,120 280,80 350,90 420,70 490,50 560,140 630,160 700,180"
            />
            {/* Example dot and tooltip */}
            <circle cx="280" cy="80" r="7" fill="#6fffc6" />
            <rect x="250" y="30" width="80" height="30" rx="8" fill="#232323" />
            <text x="290" y="50" textAnchor="middle" fill="#fff" fontSize="14">June 25</text>
            <text x="290" y="65" textAnchor="middle" fill="#a2a2a2" fontSize="12">22 Views</text>
          </svg>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-[#181818] rounded-xl p-5 border border-[#232323] flex flex-col gap-2">
          <span className="text-[#a2a2a2] text-xs flex items-center gap-1">Unique Visitors <span className="ml-1">ⓘ</span></span>
          <span className="text-white text-2xl font-bold">180</span>
        </div>
        <div className="bg-[#181818] rounded-xl p-5 border border-[#232323] flex flex-col gap-2">
          <span className="text-[#a2a2a2] text-xs flex items-center gap-1">Avg. Session Time <span className="ml-1">ⓘ</span></span>
          <span className="text-white text-2xl font-bold">2m 30s</span>
        </div>
        <div className="bg-[#181818] rounded-xl p-5 border border-[#232323] flex flex-col gap-2">
          <span className="text-[#a2a2a2] text-xs flex items-center gap-1">Bounce Rate <span className="ml-1">ⓘ</span></span>
          <span className="text-white text-2xl font-bold">45%</span>
        </div>
        <div className="bg-[#181818] rounded-xl p-5 border border-[#232323] flex flex-col gap-2">
          <span className="text-[#a2a2a2] text-xs flex items-center gap-1">Returning Visitors <span className="ml-1">ⓘ</span></span>
          <span className="text-white text-2xl font-bold">35%</span>
        </div>
      </div>

      {/* Profile Visit, Live Traffic, Top Cities, Gender */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#181818] rounded-xl p-5 border border-[#232323] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[#a2a2a2] text-xs">Profile Visit</span>
            <span className="bg-green-900 text-green-300 px-2 py-1 rounded-full text-xs font-semibold">↑ 75%</span>
          </div>
          <span className="text-white text-2xl font-bold">1.502 <span className="text-[#a2a2a2] text-xs font-normal">All time visit</span></span>
          <div className="flex gap-4 text-[#a2a2a2] text-xs">
            <span>700 <span className="font-normal">30Days</span></span>
            <span>350 <span className="font-normal">7 Days</span></span>
            <span>89 <span className="font-normal">24 hours</span></span>
          </div>
        </div>
        <div className="bg-[#181818] rounded-xl p-5 border border-[#232323] flex flex-col gap-2">
          <span className="text-[#a2a2a2] text-xs mb-2">Live Traffic</span>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-white">Jakarta</span>
              <span className="text-[#a2a2a2] text-xs">6m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Depok</span>
              <span className="text-[#a2a2a2] text-xs">50m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Bekasi</span>
              <span className="text-[#a2a2a2] text-xs">4h</span>
            </div>
          </div>
        </div>
        <div className="bg-[#181818] rounded-xl p-5 border border-[#232323] flex flex-col gap-2">
          <span className="text-[#a2a2a2] text-xs mb-2">Top Cities</span>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-white">Jakarta</span>
              <span className="text-[#a2a2a2] text-xs">60%</span>
            </div>
            <div className="w-full h-2 bg-[#232323] rounded-full mb-1">
              <div className="h-2 bg-[#6fffc6] rounded-full" style={{ width: '60%' }}></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Bogor</span>
              <span className="text-[#a2a2a2] text-xs">30%</span>
            </div>
            <div className="w-full h-2 bg-[#232323] rounded-full mb-1">
              <div className="h-2 bg-[#6fffc6] rounded-full" style={{ width: '30%' }}></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Bekasi</span>
              <span className="text-[#a2a2a2] text-xs">10%</span>
            </div>
            <div className="w-full h-2 bg-[#232323] rounded-full">
              <div className="h-2 bg-[#6fffc6] rounded-full" style={{ width: '10%' }}></div>
            </div>
          </div>
        </div>
        <div className="bg-[#181818] rounded-xl p-5 border border-[#232323] flex flex-col gap-2">
          <span className="text-[#a2a2a2] text-xs mb-2">Gender</span>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 text-white text-lg">♂️ 60%</span>
            <span className="flex items-center gap-1 text-white text-lg">♀️ 40%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InsightPage;
