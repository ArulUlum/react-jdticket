import { useState } from 'react';
import { lazy, Suspense } from 'react';

function SkeletonLoader() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-1/2 bg-[#141717] rounded mb-4" />
      <div className="flex gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-6 w-24 bg-[#141717] rounded" />
        ))}
      </div>
      <div className="h-96 w-full bg-[#141717] rounded" />
    </div>
  );
}

const AccountInformationPage = lazy(() => import('./Settings/AccountInformationPage'));
const BankAccountPage = lazy(() => import('./Settings/BankAccountPage'));

function Settings() {
  const [activeTab, setActiveTab] = useState('Account Information');

  const tabs = ['Account Information', 'Bank Account'];
  const handleTabClick = (tabValue) => {
    setActiveTab(tabValue);
  };

  return (
    <div className="min-h-screen">
      <h1 className="text-white text-2xl font-bold mb-2">Settings</h1>
      <div className="border-t border-[#303030] mb-8" />

      <div className="flex">
        {/* Sidebar */}
        <aside className="min-w-[220px]">
          <nav className="flex flex-col gap-6">
            {tabs.map((tab) => (
              <div
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`mr-4 text-resposive-medium cursor-pointer ${
                  activeTab === tab ? 'text-white' : 'text-[#A2A2A2] hover:text-white'
                }`}
              >
                {tab}
              </div>
            ))}
          </nav>
        </aside>

        <Suspense fallback={<SkeletonLoader />}>
          {activeTab === 'Account Information' && <AccountInformationPage />}
          {activeTab === 'Bank Account' && <BankAccountPage />}
        </Suspense>
      </div>
    </div>
  );
}

export default Settings;
