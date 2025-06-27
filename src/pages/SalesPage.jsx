import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Clock4,
  BanknoteArrowUp
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

const urlBe = import.meta.env.VITE_URL_BE;

const SalesPage = ({id}) => {
  const [type, setType] = useState('total sales');
  const [range, setRange] = useState('weekly');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);
  const [data, setData] = useState(null);

  const types = ['total sales', 'tickets sold', 'total visitor'];
  const ranges = ['weekly', 'daily'];

  useEffect(() => {
    fetchData(id, type, range);
  }, [id, type, range]);

  const fetchData = async (id, type, range) => {
    try {
      const response = await axios.get(`${urlBe}/events/sales/${id}/report`, {
        headers: {'x-jdticket': localStorage.getItem('token') || '',},
        params: { type, range }
      });
      setData(response.data.data);
    } catch (err) {
      console.error('Failed to fetch sales report:', err);
    }
  };

  if (data?.data_graphic.length === 1) {
    data.data_graphic.unshift({ label: '', value: 0 })
  }

  const showSpesificGraphic = (value) => {
    if (type === "total sales"){
      return [`Rp ${value.toLocaleString('id-ID')}`, '']
    }
    return [`${value.toLocaleString('id-ID')}`, '']
  }  

  const salesData = [
    {
      label: "Total Sales",
      value: "Rp. " + data?.total_sales.toLocaleString('id-ID'),
      trend: "up",
      percent: "20%",
      color: "green",
    },
    {
      label: "Tickets Sold",
      value: data?.ticket_sold.toLocaleString('id-ID') + "/" + (data?.total_ticket === -1 ? "∞" : data?.total_ticket.toLocaleString('id-ID')),
      trend: "down",
      percent: "18%",
      color: "red",
    },
    {
      label: "Total Visitor",
      value: data?.total_visitor.toLocaleString('id-ID'),
      trend: "up",
      percent: "75%",
      color: "green",
    },
  ];

  return (
    <div>
      {/* Content */}
      <div>
        {/* Summary Cards */}
        <div className="flex gap-3 justify-between items-center">
          {salesData.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#141717] rounded-xl px-4 pt-4 w-full flex-1"
            >
              {/* Top row: Label kiri, All Time kanan */}
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-[#A2A2A2]">{item.label}</div>
                <span className="text-xs text-[#A2A2A2]">All time</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-xl font-['Satoshi-Bold',_sans-serif] mb-3">
                  {item.value}
                </div>
                {/* Bottom: Trend (icon + percent) */}
                <div
                  className={`inline-flex items-center gap-1 px-2 py-[2px] text-xs font-medium rounded-md mb-3 ${item.color === "green"
                    ? "bg-green-900 text-green-400"
                    : "bg-red-900 text-red-400"
                    }`}
                >
                  {item.trend === "up" ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {item.percent}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sales Report Section */}
        <div className="bg-[#141717] text-white p-5 rounded-xl shadow-lg w-full font-['Satoshi-Medium',_sans-serif] mt-5">
          <p className="mb-4">Sales Report</p>
          <div className="flex justify-between items-center mb-6">
            <div className="relative">
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="px-4 py-2 rounded-lg border border-[#333] bg-[#1a1a1a] text-white font-['Satoshi-Medium',_sans-serif] flex items-center gap-2"
              >
                <TrendingUp className="w-3 h-3" />
                {type.replace(/\b\w/g, l => l.toUpperCase())}
                <ChevronDown className="w-4 h-4"/>
              </button>
              {showTypeDropdown && (
                <div className="absolute z-10 mt-2 bg-[#1a1a1a] border border-[#333] rounded-lg p-2 w-full font-['Satoshi-Medium',_sans-serif]">
                  {types.map(t => (
                    <div
                      key={t}
                      onClick={() => {
                        setType(t);
                        setShowTypeDropdown(false);
                      }}
                      className={`px-4 py-2 rounded cursor-pointer hover:bg-[#333] ${type === t ? 'bg-[#333]' : ''}`}
                    >
                      {t.replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowRangeDropdown(!showRangeDropdown)}
                className="px-4 py-2 rounded-lg border border-[#333] bg-[#1a1a1a] text-white font-['Satoshi-Medium',_sans-serif] flex items-center gap-2"
              >
                <Clock4 className="w-4 h-4" />
                {range.charAt(0).toUpperCase() + range.slice(1)}
                <ChevronDown className="w-4 h-4"/>
              </button>
              {showRangeDropdown && (
                <div className="absolute z-10 mt-2 bg-[#1a1a1a] border border-[#333] rounded-lg p-2 w-full font-['Satoshi-Medium',_sans-serif]">
                  {ranges.map(r => (
                    <div
                      key={r}
                      onClick={() => {
                        setRange(r);
                        setShowRangeDropdown(false);
                      }}
                      className={`px-4 py-2 rounded cursor-pointer hover:bg-[#333] ${range === r ? 'bg-[#333]' : ''}`}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {data?.data_graphic.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm border border-dashed border-gray-700 rounded-lg">
              No data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data?.data_graphic} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF66" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00FF66" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="label" stroke="#ccc" tick={{ fontSize: 10 }} />
                <YAxis stroke="#ccc" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v.toLocaleString('id-ID')}`} />
                <Tooltip formatter={(value) => showSpesificGraphic(value)} labelStyle={{ color: '#fff', fontSize: 12 }} contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#00FF66', fontSize: 12 }} />
                <Area type="monotone" dataKey="value" stroke="#00FF66" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Ticket Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-3 mt-5">
          {data?.list_ticket.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#141717] rounded-xl px-4 pt-4 w-full flex-1"
            >
              {/* Top row: Label kiri, All Time kanan */}
              <div className="flex justify-between items-center mb-2">
                <div className='flex items-center gap-4'>
                  <div className="text-sm text-[#A2A2A2]">{item.name}</div>
                  {item.is_approval && (
                    <span className="text-xs bg-[#3C2F14] text-[#F5C249] px-2 py-0.5 rounded-full ">
                      Need Approval
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#A2A2A2]">Tickets</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-xl font-['Satoshi-Bold',_sans-serif] mb-3">
                  {item.sold_ticket.toLocaleString('id-ID')}/{item.max_capacity === -1 ? "∞" : item?.max_capacity.toLocaleString('id-ID')}
                </div>                
              </div>
            </div>
          ))}
        </div>

        {/* Withdrawal Button */}
        <div className="mt-5">
          <button className="bg-[#1C1D1D] text-white font-['Satoshi-Bold'] text-lg w-full py-4 rounded-[10px] gap-2 flex items-center justify-center">
            <BanknoteArrowUp className="w-7 h-7"/>
            Withdrawal
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
