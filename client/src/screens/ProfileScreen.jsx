import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';
import ProfileSidebar from '../components/ProfileSidebar';
import toast from 'react-hot-toast';

const ProfileScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('Male');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { userInfo, updateSession } = useContext(StoreContext);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      setFirstName(userInfo.firstName || userInfo.name?.split(' ')[0] || '');
      setLastName(userInfo.lastName || userInfo.name?.split(' ').slice(1).join(' ') || '');
      setGender(userInfo.gender || 'Male');
      setMobile(userInfo.mobile || '');
      setEmail(userInfo.email || '');
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();

    const fullName = `${firstName} ${lastName}`.trim();

    try {
      setLoading(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.put(
        '/api/users/profile',
        { 
          name: fullName, 
          firstName, 
          lastName, 
          gender, 
          mobile, 
          email, 
          password: password || undefined 
        },
        config
      );

      updateSession(data);
      toast.success('Profile Updated Successfully!');
      setLoading(false);
      setPassword('');
    } catch (err) {
      toast.error(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
      setLoading(false);
    }
  };

  const handleComingSoon = () => {
    alert("This feature is coming soon!");
  };

  return (
    <div className="min-h-screen bg-bg-base py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        
        {/* Left Sidebar (Fixed Width on Desktop) */}
        <ProfileSidebar activeTab="profile" />

        {/* Main Content Area (Fluid Width) */}
        <div className="flex-1 bg-surface rounded-xl shadow-md border border-accent-gold/10 p-6 md:p-8 flex flex-col gap-8">
          <Link to="/account" className="md:hidden flex items-center gap-2 text-accent-gold font-semibold mb-2 hover:text-accent-gold-hover transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            Back to Profile
          </Link>
          


          <form onSubmit={submitHandler} className="flex flex-col gap-8">
            
            {/* Personal Information */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-text-primary">Personal Information</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="px-4 py-3 bg-bg-base border border-accent-gold/20 rounded focus:outline-none focus:border-accent-gold text-text-primary"
                  />
                </div>
                <div className="flex flex-col">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="px-4 py-3 bg-bg-base border border-accent-gold/20 rounded focus:outline-none focus:border-accent-gold text-text-primary"
                  />
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-text-secondary mb-2">Your Gender</p>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="gender" 
                      value="Male" 
                      checked={gender === 'Male'} 
                      onChange={(e) => setGender(e.target.value)}
                      className="accent-accent-gold w-4 h-4" 
                    />
                    <span className="text-text-primary">Male</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="gender" 
                      value="Female" 
                      checked={gender === 'Female'} 
                      onChange={(e) => setGender(e.target.value)}
                      className="accent-accent-gold w-4 h-4" 
                    />
                    <span className="text-text-primary">Female</span>
                  </label>
                </div>
              </div>
            </section>

            {/* Email Address Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-text-primary">Email Address</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 py-3 bg-bg-base border border-accent-gold/20 rounded focus:outline-none focus:border-accent-gold text-text-primary"
                />
              </div>
            </section>

            {/* Mobile Number Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-text-primary">Mobile Number</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91"
                  className="px-4 py-3 bg-bg-base border border-accent-gold/20 rounded focus:outline-none focus:border-accent-gold text-text-primary"
                />
              </div>
            </section>

            {/* Update Password Option */}
            <section className="border-t border-accent-gold/10 pt-6">
              <h2 className="text-xl font-bold text-text-primary mb-4">Change Password</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="password"
                  placeholder="New Password (Leave blank to keep current)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="px-4 py-3 bg-bg-base border border-accent-gold/20 rounded focus:outline-none focus:border-accent-gold text-text-primary"
                />
              </div>
            </section>

            <div className="pt-4 flex justify-start">
              <button 
                type="submit" 
                disabled={loading} 
                className="bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-bold py-3 px-8 rounded transition-colors text-lg"
              >
                {loading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>

          {/* Deactivate Account */}
          <div className="mt-8 pt-6 border-t border-accent-gold/10 flex justify-start">
            <button onClick={handleComingSoon} className="text-red-500/80 hover:text-red-500 text-sm font-bold transition-colors">
              Deactivate Account
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
