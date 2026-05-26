import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

const ADMIN_EMAIL = 'xuantinhsea@gmail.com';

export default function AdminPanel({ open, onClose }) {
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAdmin = user?.primaryEmailAddress?.emailAddress === ADMIN_EMAIL;

  useEffect(() => {
    if (!open || !isAdmin) return;

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin-users', {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_ADMIN_SECRET}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await res.json();
        setUsers(data.users || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [open, isAdmin]);

  if (!open) return null;

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-sm text-slate-600 mb-4">You don't have admin access.</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Registered Users</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-auto flex-1 p-6">
          {loading && <p className="text-center text-slate-500">Loading...</p>}
          {error && <p className="text-center text-red-600 text-sm">Error: {error}</p>}

          {!loading && !error && users.length === 0 && (
            <p className="text-center text-slate-500">No users registered yet.</p>
          )}

          {!loading && !error && users.length > 0 && (
            <>
              <div className="mb-4 text-sm text-slate-600">
                <strong>{users.length}</strong> {users.length === 1 ? 'user' : 'users'} registered
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left px-4 py-2 font-semibold text-slate-700">Name</th>
                      <th className="text-left px-4 py-2 font-semibold text-slate-700">Email</th>
                      <th className="text-left px-4 py-2 font-semibold text-slate-700">Signed Up</th>
                      <th className="text-left px-4 py-2 font-semibold text-slate-700">Last Login</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-2 text-slate-900">
                          {u.firstName || u.lastName
                            ? `${u.firstName} ${u.lastName}`.trim()
                            : '(no name)'}
                        </td>
                        <td className="px-4 py-2 text-slate-600">{u.email}</td>
                        <td className="px-4 py-2 text-slate-600">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : '—'}
                        </td>
                        <td className="px-4 py-2 text-slate-600">
                          {u.lastSignIn
                            ? new Date(u.lastSignIn).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'Never'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
