import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import axios from 'axios';

const urlBe = import.meta.env.VITE_URL_BE;

const BankAccountPage = () => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    bank_name: '',
    account_number: '',
    account_name: '',
  });

  const fetchBankAccounts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${urlBe}/user/bank-accounts`, {
        headers: {
          'x-jdticket': localStorage.getItem('token') || '',
        },
      });
      if (res.data && res.data.code === '1') {
        setBankAccounts(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch bank accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.bank_name || !form.account_number || !form.account_name) {
      alert('Please fill out all fields');
      return;
    }
    try {
      const res = await axios.post(`${urlBe}/user/bank-accounts/add`, form, {
        headers: {
          'x-jdticket': localStorage.getItem('token') || '',
        },
      });
      alert(res.data.message || 'Bank account added successfully!');
      setIsAdding(false);
      setForm({ bank_name: '', account_number: '', account_name: '' });
      fetchBankAccounts();
    } catch (err) {
      console.error('Failed to add bank account:', err);
      alert(err.response?.data?.message || 'Failed to add bank account');
    }
  };

  const handleDelete = async (accountId) => {
    if (!window.confirm('Are you sure you want to delete this bank account?')) {
      return;
    }
    try {
      const res = await axios.delete(`${urlBe}/user/bank-accounts/${accountId}`, {
        headers: {
          'x-jdticket': localStorage.getItem('token') || '',
        },
      });
      alert(res.data.message || 'Bank account deleted successfully!');
      fetchBankAccounts();
    } catch (err) {
      console.error('Failed to delete bank account:', err);
      alert(err.response?.data?.message || 'Failed to delete bank account');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 w-full text-white">
        <span className="text-responsive-medium-big">Loading...</span>
      </div>
    );
  }

  const hasData = bankAccounts.length > 0 && !isAdding;
  const currentAccount = hasData ? bankAccounts[0] : null;

  return (
    <div className="flex flex-col md:flex-row md:items-start gap-4 w-full">
      <div className="flex-1 flex flex-col gap-6">
        <div>
          <h2 className="text-white text-responsive-medium-big mb-4">Bank Account</h2>
          
          {bankAccounts.map((account, index) => (
            <div key={account.id} className="mb-6 pb-6 border-b border-[#232323] last:border-b-0 last:mb-0 last:pb-0">
              {bankAccounts.length > 1 && (
                <h3 className="text-white text-sm font-semibold mb-3">Bank Account #{index + 1}</h3>
              )}
              <div className="mb-4">
                <label className="block text-white text-responsive-medium-normal mb-1">Bank Name</label>
                <input
                  value={account.bank_name}
                  readOnly
                  disabled
                  className="w-full rounded-lg px-3 py-2 outline-none transition bg-[#181818] border-none text-[#a2a2a2] cursor-not-allowed"
                />
              </div>
              <div className="mb-4">
                <label className="block text-white text-responsive-medium-normal mb-1">
                  Account Number
                </label>
                <input
                  value={account.account_number}
                  readOnly
                  disabled
                  className="w-full rounded-lg px-3 py-2 outline-none transition bg-[#181818] border-none text-[#a2a2a2] cursor-not-allowed"
                />
              </div>
              <div className="mb-4">
                <label className="block text-white text-responsive-medium-normal mb-1">
                  Account Name
                </label>
                <input
                  value={account.account_name}
                  readOnly
                  disabled
                  className="w-full rounded-lg px-3 py-2 outline-none transition bg-[#181818] border-none text-[#a2a2a2] cursor-not-allowed"
                />
              </div>
              <button
                onClick={() => handleDelete(account.id)}
                className="mt-2 w-full md:w-fit bg-[#E54D4D] text-white rounded-lg px-4 py-2 hover:bg-[#c93b3b] transition font-medium text-sm"
              >
                Delete Bank
              </button>
            </div>
          ))}
        </div>

        {bankAccounts.length > 0 && !isAdding && (
          <button
            onClick={() => {
              setIsAdding(true);
              setForm({ bank_name: '', account_number: '', account_name: '' });
            }}
            className="w-full md:w-fit border border-white text-white rounded-lg px-4 py-2 bg-transparent hover:bg-white hover:text-[#141717] transition font-medium text-sm"
          >
            Add Bank
          </button>
        )}

        {(bankAccounts.length === 0 || isAdding) && (
          <div className="border-t border-[#232323] pt-6 first:border-t-0 first:pt-0">
            {bankAccounts.length > 0 && (
              <h3 className="text-white text-responsive-medium-normal font-semibold mb-4">Add Bank Account</h3>
            )}
            <div className="mb-4">
              <label className="block text-white text-responsive-medium-normal mb-1">Bank Name</label>
              <input
                name="bank_name"
                placeholder="Choose bank"
                value={form.bank_name}
                onChange={handleChange}
                className="w-full bg-transparent border border-white rounded-lg px-3 py-2 text-white outline-none"
              />
            </div>
            <div className="mb-4">
              <label className="block text-white text-responsive-medium-normal mb-1">
                Account Number
              </label>
              <input
                name="account_number"
                placeholder="Enter account number"
                value={form.account_number}
                onChange={handleChange}
                className="w-full bg-transparent border border-white rounded-lg px-3 py-2 text-white outline-none"
              />
            </div>
            <div className="mb-4">
              <label className="block text-white text-responsive-medium-normal mb-1">
                Account Name
              </label>
              <input
                name="account_name"
                placeholder="Enter account name"
                value={form.account_name}
                onChange={handleChange}
                className="w-full bg-transparent border border-white rounded-lg px-3 py-2 text-white outline-none"
              />
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSave}
                className="bg-white text-[#141717] rounded-lg px-4 py-2 hover:bg-[#303030] hover:text-white transition font-medium text-sm"
              >
                Save Update
              </button>
              {bankAccounts.length > 0 && (
                <button
                  onClick={() => setIsAdding(false)}
                  className="border border-white text-white rounded-lg px-4 py-2 bg-transparent hover:bg-white hover:text-[#141717] transition font-medium text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="bg-[#181818] border border-[#232323] rounded-lg p-4 flex items-start gap-2 max-w-[220px]">
        <Info className="w-12 h-12 text-white" />
        <span className="text-white text-responsive-caption">
          Please ensure that the account number and account holder's name are correct
        </span>
      </div>
    </div>
  );
};

export default BankAccountPage;
