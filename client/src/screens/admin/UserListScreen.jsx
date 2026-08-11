import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';

const UserListScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const { userInfo } = useContext(StoreContext);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get('/api/users', config);
      setUsers(data);
      setError('');
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]);

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setDeleteLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        await axios.delete(`/api/users/${id}`, config);
        fetchUsers(); // Refresh the list
      } catch (err) {
        alert(
          err.response && err.response.data.message
            ? err.response.data.message
            : err.message
        );
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <svg className="animate-spin h-10 w-10 text-accent-gold" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-accent-gold/10 border border-accent-gold/20 text-accent-gold px-5 py-4 rounded-xl mb-6 font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto py-6">
      <h1 className="text-3xl font-serif font-extrabold text-text-primary mb-8">Users</h1>
      
      <div className="bg-surface rounded-3xl shadow-sm border border-accent-gold/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-transparent text-text-primary/80 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold text-center">Admin</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-walnut/10">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-transparent transition-colors">
                  <td className="p-4 text-text-primary/60 text-sm">{user._id}</td>
                  <td className="p-4 text-text-primary font-medium">{user.name}</td>
                  <td className="p-4 text-text-primary/60">
                    <a href={`mailto:${user.email}`} className="hover:text-accent-gold transition-colors">
                      {user.email}
                    </a>
                  </td>
                  <td className="p-4 text-center">
                    {user.isAdmin ? (
                      <svg className="w-6 h-6 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/user/${user._id}/edit`}
                        className="inline-flex items-center justify-center p-2 bg-transparent hover:bg-accent-gold/10 hover:text-accent-gold rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => deleteHandler(user._id)}
                        disabled={deleteLoading}
                        className="inline-flex items-center justify-center p-2 bg-gray-100 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserListScreen;
