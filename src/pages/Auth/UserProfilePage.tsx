import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SimpleLayout } from '../../layouts/AppLayout';
import { useAppSelector } from '../../store';

const mockSubscription = {
  plan: 'Pro',
  status: 'active',
  nextBillingDate: 'September 15, 2023',
  usage: {
    storage: {
      used: 45.2,
      total: 100,
      unit: 'GB',
    },
    projects: {
      used: 3,
      total: 10,
    },
    teamMembers: {
      used: 2,
      total: 5,
    },
  },
};

const planLimits = {
  Free: {
    storage: 5,
    projects: 3,
    teamMembers: 1,
  },
  Pro: {
    storage: 100,
    projects: 10,
    teamMembers: 5,
  },
  Enterprise: {
    storage: 1000,
    projects: 'Unlimited',
    teamMembers: 'Unlimited',
  },
};

interface UsageMeterProps {
  used: number;
  total: number;
  unit?: string;
}

const UsageMeter = ({ used, total, unit = '' }: UsageMeterProps) => {
  const percentage = Math.min(100, Math.round((used / total) * 100));
  
  return (
    <div className="mt-1">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[var(--text-muted)]">
          {used.toFixed(1)} {unit} of {total} {unit}
        </span>
        <span className="font-medium">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-[var(--primary)] h-2 rounded-full" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export function UserProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAppSelector((state)=> state.auth);
console.log(user)
  const [formData, setFormData] = useState<{name: string, email: string}>({
    name: user?.firstName || "",
    email: user?.email || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would update the user's profile here
    setIsEditing(false);
  };

  const handleUpgrade = () => {
    // In a real app, this would navigate to a pricing/upgrade page
    console.log('Upgrade plan');
  };

  return (
    <SimpleLayout>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="px-6 py-8 bg-gradient-to-r from-white to-violet text-white">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-24 w-24 rounded-full border-4 border-white"
                  src={user?.avatar}
                  alt={user?.firstName}
                />
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                <h1 className="text-2xl text-black dark:text-white font-bold">{user?.firstName}</h1>
                <p className="text-primary">{user?.email}</p>
                {/* <p className="text-blue-100 text-sm mt-1">Member since {mockUserData.joinDate}</p> */}
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Information */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Profile Information
                    </h3>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    {isEditing ? (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm"
                          />
                        </div>
                        <div className="flex justify-end space-x-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]"
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-black dark:text-white">Name</p>
                          <p className="mt-1 text-sm text-black dark:text-white">{formData.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-black dark:text-white">Email</p>
                          <p className="mt-1 text-sm text-black dark:text-white">{formData.email}</p>
                        </div>
                        <div className="pt-2">
                          <button
                            onClick={() => setIsEditing(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]"
                          >
                            Edit Profile
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Security */}
                <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Security
                    </h3>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    <div className="space-y-4">
                      <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Password</p>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">•••••••••••••</p>
                            <button
                              onClick={() => navigate('/change-password')}
                              className="mt-2 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]"
                            >
                              Change Password
                            </button>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Two-Factor Authentication</p>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">Not enabled</p>
                            <button
                              onClick={() => navigate('/security/2fa')}
                              className="mt-2 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]"
                            >
                              Set up two-factor authentication
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subscription & Usage */}
                  <div className="space-y-6">
                    {/* Subscription Card */}
                    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden">
                      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                            Subscription
                          </h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            mockSubscription.status === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {mockSubscription.status.charAt(0).toUpperCase() + mockSubscription.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {mockSubscription.plan} Plan
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Next billing date: {mockSubscription.nextBillingDate}
                            </p>
                          </div>
                          <button
                            onClick={handleUpgrade}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]"
                          >
                            Upgrade Plan
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Usage Stats */}
                    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden">
                      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                          Usage
                        </h3>
                      </div>
                      <div className="px-4 py-5 sm:p-6 space-y-6">
                        <div>
                          <div className="flex justify-between">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Storage</h4>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {mockSubscription.usage.storage.used} / {mockSubscription.usage.storage.total} {mockSubscription.usage.storage.unit}
                            </span>
                          </div>
                          <UsageMeter 
                            used={mockSubscription.usage.storage.used} 
                            total={mockSubscription.usage.storage.total} 
                            unit={mockSubscription.usage.storage.unit} 
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Projects</h4>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {mockSubscription.usage.projects.used} / {mockSubscription.usage.projects.total}
                            </span>
                          </div>
                          <UsageMeter 
                            used={mockSubscription.usage.projects.used} 
                            total={mockSubscription.usage.projects.total} 
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Team Members</h4>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {mockSubscription.usage.teamMembers.used} / {mockSubscription.usage.teamMembers.total}
                            </span>
                          </div>
                          <UsageMeter 
                            used={mockSubscription.usage.teamMembers.used} 
                            total={mockSubscription.usage.teamMembers.total} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Comparison */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Plan Comparison
                    </h3>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Feature</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Free</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pro</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Enterprise</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          <tr>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">Storage</td>
                            <td className="px-4 py-3 text-center text-sm">{planLimits.Free.storage}GB</td>
                            <td className="px-4 py-3 text-center text-sm bg-blue-50 dark:bg-blue-900/30">{planLimits.Pro.storage}GB</td>
                            <td className="px-4 py-3 text-center text-sm">{planLimits.Enterprise.storage}GB</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">Projects</td>
                            <td className="px-4 py-3 text-center text-sm">{planLimits.Free.projects}</td>
                            <td className="px-4 py-3 text-center text-sm bg-blue-50 dark:bg-blue-900/30">{planLimits.Pro.projects}</td>
                            <td className="px-4 py-3 text-center text-sm">{planLimits.Enterprise.projects}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">Team Members</td>
                            <td className="px-4 py-3 text-center text-sm">{planLimits.Free.teamMembers}</td>
                            <td className="px-4 py-3 text-center text-sm bg-blue-50 dark:bg-blue-900/30">{planLimits.Pro.teamMembers}</td>
                            <td className="px-4 py-3 text-center text-sm">{planLimits.Enterprise.teamMembers}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">Priority Support</td>
                            <td className="px-4 py-3 text-center text-sm">✕</td>
                            <td className="px-4 py-3 text-center text-sm bg-blue-50 dark:bg-blue-900/30">✓</td>
                            <td className="px-4 py-3 text-center text-sm">✓</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">API Access</td>
                            <td className="px-4 py-3 text-center text-sm">Read Only</td>
                            <td className="px-4 py-3 text-center text-sm bg-blue-50 dark:bg-blue-900/30">Full Access</td>
                            <td className="px-4 py-3 text-center text-sm">Full Access</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-6 text-center">
                      <button
                        onClick={handleUpgrade}
                        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]"
                      >
                        Upgrade to Enterprise
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
    </SimpleLayout>
  );
}

export default UserProfilePage;
