import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';

const UserEditScreen = () => {
  const { id: userId } = useParams();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  const navigate = useNavigate();
  const { userInfo } = useContext(StoreContext);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const { data } = await axios.get(`/api/users/${userId}`, config);
        setName(data.name);
        setEmail(data.email);
        setIsAdmin(data.isAdmin);
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

    fetchUser();
  }, [userId, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.put(
        `/api/users/${userId}`,
        { name, email, isAdmin },
        config
      );
      
      navigate('/admin/userlist');
    } catch (err) {
      alert(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
      setUpdateLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto py-8">
      <Link
        to="/admin/userlist"
        className="inline-flex items-center text-text-primary/60 hover:text-accent-gold font-medium mb-6 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Go Back
      </Link>

      <div className="bg-transparent rounded-3xl shadow-sm border border-accent-gold/20 p-8">
        <h1 className="text-3xl font-serif font-extrabold text-text-primary mb-8">Edit User</h1>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-8 w-8 text-accent-gold" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : error ? (
          <div className="bg-accent-gold/10 border border-accent-gold/20 text-accent-gold px-5 py-4 rounded-xl mb-6 font-medium">
            {error}
          </div>
        ) : (
          <form onSubmit={submitHandler} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-text-primary/80 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface border border-accent-gold/20 text-text-primary rounded-xl focus:ring-accent-gold focus:border-accent-gold block p-3 transition-colors outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-text-primary/80 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface border border-accent-gold/20 text-text-primary rounded-xl focus:ring-accent-gold focus:border-accent-gold block p-3 transition-colors outline-none"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                id="isAdmin"
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="w-5 h-5 text-accent-gold bg-surface border-accent-gold/20 rounded focus:ring-accent-gold focus:ring-2 cursor-pointer accent-terracotta"
              />
              <label htmlFor="isAdmin" className="ml-3 text-sm font-semibold text-text-primary/80 cursor-pointer select-none">
                Is Admin
              </label>
            </div>

            <button
              type="submit"
              disabled={updateLoading}
              className="w-full bg-accent-gold hover:bg-accent-gold-hover text-white font-bold text-lg py-4 rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateLoading ? 'Processing...' : 'Update'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserEditScreen;
