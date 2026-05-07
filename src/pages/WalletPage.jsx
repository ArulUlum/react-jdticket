import { useState, useEffect } from 'react';
import { Wallet } from 'lucide-react';
import axios from 'axios';

const urlBe = import.meta.env.VITE_URL_BE;

function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [eventBalances, setEventBalances] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [withdrawPassword, setWithdrawPassword] = useState('');
  const [withdrawTax, setWithdrawTax] = useState(0);
  const [showTaxField, setShowTaxField] = useState(false);

  // Fetch wallet data
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${urlBe}/user/wallet`, {
          headers: {
            'x-jdticket': localStorage.getItem('token') || '',
          },
        });
        const walletData = response.data.data;

        setBalance(walletData.total_balance);
        setTotalTax(walletData.total_tax);

        // Transform events data to match the event balances format
        const transformedEvents = walletData.events.map(event => ({
          name: event.event_name,
          balance: event.balance,
          tax: 0, // Tax per event not provided in API response
        }));
        setEventBalances(transformedEvents);

        // Set payment history if available
        if (walletData.payment_history && walletData.payment_history.length > 0) {
          setPayments(walletData.payment_history);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching wallet data:', err);
        setError('Failed to load wallet data');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  return (
    <div className="min-h-screen pb-5">
      <h1 className="text-white text-2xl font-bold mb-2">Wallet</h1>
      <p className="text-[#a2a2a2] mb-8">Easily manage your event earnings and withdrawals.</p>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-white text-lg">Loading wallet data...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-4 mb-8">
          <div className="text-red-400">{error}</div>
        </div>
      )}

      {/* Current Balance */}
      {!loading && (
        <div className="flex flex-col items-center mb-8">
          <span className="text-[#a2a2a2] text-lg mb-2">Current Balance</span>
          <div className="text-white text-4xl md:text-5xl font-bold mb-4">
            Rp {balance.toLocaleString('id-ID')}
          </div>
          <button
            className="bg-white text-black rounded-lg px-6 py-2 font-medium flex items-center gap-2 shadow-md"
            onClick={() => {
              setWithdrawAmount(balance);
              setShowModal(true);
            }}
          >
            <Wallet className="w-5 h-5" /> Withdrawal
          </button>
          {/* Withdrawal Modal */}
          {showModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
              onClick={() => {
                setShowModal(false);
                setShowTaxField(false);
              }}
            >
              <div
                className="bg-[#181818] rounded-2xl shadow-xl p-8 w-full max-w-md relative border border-[#232323]"
                onClick={(e) => e.stopPropagation()}
              >
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
                    <span className="text-white text-lg font-bold mr-2">Rp.</span>
                    <input
                      type="text"
                      value={withdrawAmount.toLocaleString('id-ID')}
                      onChange={(e) => {
                        const value = Number(e.target.value.replace(/\./g, '').replace(/,/g, ''));
                        if (!isNaN(value) && value <= balance) {
                          setWithdrawAmount(value);
                        }
                      }}
                      className="bg-transparent text-white text-lg font-bold flex-1 outline-none"
                      placeholder="0"
                    />
                    <button
                      className="bg-[#303030] text-white px-4 py-1 rounded-lg ml-2 text-sm font-medium"
                      onClick={() => setWithdrawAmount(balance)}
                    >
                      Max
                    </button>
                  </div>
                  {!showTaxField && (
                    <div 
                      onClick={() => setShowTaxField(true)}
                      className="flex items-center mt-2 text-[#a2a2a2] hover:text-white transition cursor-pointer"
                    >
                      <span className="text-lg mr-1">+</span>
                      <span className="text-base font-medium">Withdrawal Tax</span>
                    </div>
                  )}
                </div>
                {showTaxField && (
                  <div className="mb-4">
                    <label className="block text-white mb-1">Tax</label>
                    <div className="flex items-center bg-[#232323] rounded-lg px-3 py-2">
                      <span className="text-white text-lg font-bold mr-2">Rp.</span>
                      <input
                        type="text"
                        value={withdrawTax.toLocaleString('id-ID')}
                        onChange={(e) => {
                          const value = Number(e.target.value.replace(/\./g, '').replace(/,/g, ''));
                          if (!isNaN(value) && value <= totalTax) {
                            setWithdrawTax(value);
                          }
                        }}
                        className="bg-transparent text-white text-lg font-bold flex-1 outline-none"
                        placeholder="0"
                      />
                      <button
                        className="bg-[#303030] text-white px-4 py-1 rounded-lg ml-2 text-sm font-medium"
                        onClick={() => setWithdrawTax(totalTax)}
                      >
                        Max
                      </button>
                    </div>
                  </div>
                )}
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
      )}
      {/* Event Balances */}
      {!loading && eventBalances.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-10">
          {eventBalances.map((ev) => (
            <div key={ev.name} className="bg-[#141717] rounded-xl p-5">
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
      )}

      {/* Payment History */}
      {!loading && (
        <>
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
        </>
      )}
    </div>
  );
}

export default WalletPage;
