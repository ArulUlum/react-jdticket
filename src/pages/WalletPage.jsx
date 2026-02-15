import { useState } from 'react';
import { Wallet } from 'lucide-react';

const eventBalances = [
  { name: 'XYZ Music Festival', balance: 10000000, tax: 1000000 },
  { name: 'Volleyball', balance: 5000000, tax: 0 },
  { name: 'Tennis', balance: 5000000, tax: 5000000 },
];

function WalletPage() {
  const [balance] = useState(20000000);
  const [showModal, setShowModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(balance);
  const [withdrawPassword, setWithdrawPassword] = useState('');
  // Example payment history data
  const payments = [
    {
      id: 'asd-asd-asda',
      time: '9 July 2025 · 23.00',
      bank: 'BCA',
      accountName: 'Andi Muh Shabrani',
      accountNumber: '5212412847',
      amount: 5000000,
      status: 'Success',
    },
    {
      id: 'asd-asd-asda',
      time: '9 July 2025 · 23.00',
      bank: 'BCA',
      accountName: 'Andi Muh Shabrani',
      accountNumber: '5212412847',
      amount: 5000000,
      status: 'Success',
    },
    {
      id: 'asd-asd-asda',
      time: '9 July 2025 · 23.00',
      bank: 'BCA',
      accountName: 'Andi Muh Shabrani',
      accountNumber: '5212412847',
      amount: 5000000,
      status: 'Success',
    },
  ];

  return (
    <div className="min-h-screen pb-5">
      <h1 className="text-white text-2xl font-bold mb-2">Wallet</h1>
      <p className="text-[#a2a2a2] mb-8">Easily manage your event earnings and withdrawals.</p>

      {/* Current Balance */}
      <div className="flex flex-col items-center mb-8">
        <span className="text-[#a2a2a2] text-lg mb-2">Current Balance</span>
        <div className="text-white text-4xl md:text-5xl font-bold mb-4">
          Rp {balance.toLocaleString('id-ID')}
        </div>
        <button
          className="bg-white text-black rounded-lg px-6 py-2 font-medium flex items-center gap-2 shadow-md"
          onClick={() => setShowModal(true)}
        >
          <Wallet className="w-5 h-5" /> Withdrawal
        </button>
        {/* Withdrawal Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-[#181818] rounded-2xl shadow-xl p-8 w-full max-w-md relative border border-[#232323]">
              <button
                className="absolute top-4 right-4 text-[#a2a2a2] text-xl font-bold"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                ×
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#232323] rounded-lg p-3">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <span className="text-white text-2xl font-bold">Withdrawal</span>
              </div>
              <p className="text-[#a2a2a2] mb-6">
                Enter the amount you wish to withdraw and confirm with your password.
              </p>
              <div className="mb-4">
                <label className="block text-white mb-1">Amount</label>
                <div className="flex items-center bg-[#232323] rounded-lg px-3 py-2">
                  <span className="text-white text-lg font-bold flex-1">
                    Rp {withdrawAmount.toLocaleString('id-ID')}
                  </span>
                  <button
                    className="bg-[#303030] text-white px-4 py-1 rounded-lg ml-2 text-sm font-medium"
                    onClick={() => setWithdrawAmount(balance)}
                  >
                    Max
                  </button>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-[#a2a2a2] text-base font-medium">+ Withdrawal Tax</span>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-white mb-1">Password</label>
                <input
                  type="password"
                  value={withdrawPassword}
                  onChange={(e) => setWithdrawPassword(e.target.value)}
                  className="w-full bg-[#232323] border border-[#232323] rounded-lg px-3 py-2 text-white outline-none"
                  placeholder="Enter your password"
                />
              </div>
              <button
                className="w-full bg-white text-black rounded-lg px-4 py-3 font-bold text-lg mt-2"
                onClick={() => {
                  /* handle withdrawal logic here */
                }}
              >
                Proceed Withdrawal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Event Balances */}
      <div className="flex flex-wrap gap-4 mb-10">
        {eventBalances.map((ev) => (
          <div key={ev.name} className="bg-[#141717] rounded-xl p-5 min-w-[220px] flex-1">
            <div className="text-white text-lg font-bold mb-1">{ev.name}</div>
            <div className="text-white text-xl font-bold mb-1">
              Rp {ev.balance.toLocaleString('id-ID')}
            </div>
            <div className="text-[#a2a2a2] text-sm">
              Tax Balance : Rp {ev.tax.toLocaleString('id-ID')}
            </div>
          </div>
        ))}
      </div>

      {/* Payment History */}
      <h2 className="text-white text-xl font-bold mb-2">Payment History</h2>
      <p className="text-[#a2a2a2] mb-8">View all your past payouts and transactions here.</p>
      {payments && payments.length > 0 ? (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-[#141717] text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-white text-sm">
                <th className="px-3 py-2">Transaction ID</th>
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Bank</th>
                <th className="px-3 py-2">Account Name</th>
                <th className="px-3 py-2">Account Number</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, idx) => (
                <tr key={idx} className="rounded-lg text-white text-sm">
                  <td className="px-3 py-2 font-mono">{p.id}</td>
                  <td className="px-3 py-2">{p.time}</td>
                  <td className="px-3 py-2">{p.bank}</td>
                  <td className="px-3 py-2">{p.accountName}</td>
                  <td className="px-3 py-2 font-mono">{p.accountNumber}</td>
                  <td className="px-3 py-2">Rp {p.amount.toLocaleString('id-ID')}</td>
                  <td className="px-3 py-2">
                    <span className="bg-green-700 text-white rounded px-3 py-1 text-xs font-semibold">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center mt-10">
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="20" y="30" width="80" height="60" rx="10" fill="#232323" />
            <circle cx="90" cy="90" r="18" fill="#232323" />
            <text x="60" y="65" textAnchor="middle" fill="#a2a2a2" fontSize="24" fontWeight="bold">
              $
            </text>
            <text x="90" y="97" textAnchor="middle" fill="#a2a2a2" fontSize="18">
              🕒
            </text>
          </svg>
          <div className="text-white text-lg font-bold mt-4">No Payments</div>
          <div className="text-[#a2a2a2]">Your payments will appear here</div>
        </div>
      )}
    </div>
  );
}

export default WalletPage;
