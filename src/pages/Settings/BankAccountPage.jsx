import React from 'react';
import { Info } from 'lucide-react';

const BankAccountPage = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-start gap-4 w-full">
      <div className="flex-1">
        <h2 className="text-white text-responsive-medium-big mb-4">Bank Account</h2>
        <div className="mb-4">
          <label className="block text-white text-responsive-medium-normal mb-1">Bank Name</label>
          <input
            name="username"
            placeholder="Choose bank"
            className="w-full bg-transparent border border-white rounded-lg px-3 py-2 text-white outline-none"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white text-responsive-medium-normal mb-1">
            Account Number
          </label>
          <input
            name="username"
            placeholder="Enter account number"
            className="w-full bg-transparent border border-white rounded-lg px-3 py-2 text-white outline-none"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white text-responsive-medium-normal mb-1">
            Account Name
          </label>
          <input
            name="username"
            placeholder="Enter account name"
            className="w-full bg-transparent border border-white rounded-lg px-3 py-2 text-white outline-none"
          />
        </div>
        <button className="bg-white text-[#141717] rounded-lg px-4 py-2 hover:bg-[#303030] transition">
          Save Update
        </button>
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
