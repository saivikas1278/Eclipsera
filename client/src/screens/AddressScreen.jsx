import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';
import ProfileSidebar from '../components/ProfileSidebar';
import toast from 'react-hot-toast';

const AddressScreen = () => {
  const { userInfo, updateSession } = useContext(StoreContext);
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState(userInfo?.addresses || []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [label, setLabel] = useState('Home');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      setAddresses(userInfo.addresses || []);
    }
  }, [navigate, userInfo]);

  const openForm = (address = null) => {
    if (address) {
      setEditingId(address._id);
      setLabel(address.label);
      setStreet(address.street);
      setCity(address.city);
      setState(address.state);
      setPostalCode(address.postalCode);
      setCountry(address.country);
      setPhone(address.phone);
      setIsDefault(address.isDefault);
    } else {
      setEditingId(null);
      setLabel('Home');
      setStreet('');
      setCity('');
      setState('');
      setPostalCode('');
      setCountry('India');
      setPhone('');
      setIsDefault(addresses.length === 0);
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${userInfo.token}` }
  });

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    const addressData = { label, street, city, state, postalCode, country, phone, isDefault };

    try {
      let updatedAddresses;
      if (editingId) {
        const { data } = await axios.put(`/api/users/addresses/${editingId}`, addressData, getAuthHeader());
        updatedAddresses = data;
      } else {
        const { data } = await axios.post('/api/users/addresses', addressData, getAuthHeader());
        updatedAddresses = data;
      }
      
      updateSession({ ...userInfo, addresses: updatedAddresses });
      setAddresses(updatedAddresses);
      toast.success(editingId ? 'Address updated' : 'Address added');
      closeForm();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const { data } = await axios.delete(`/api/users/addresses/${id}`, getAuthHeader());
        updateSession({ ...userInfo, addresses: data });
        setAddresses(data);
        toast.success('Address deleted');
      } catch (err) {
        toast.error(err.response?.data?.message || err.message);
      }
    }
  };

  const setAsDefaultHandler = async (id) => {
      try {
      const { data } = await axios.put(`/api/users/addresses/${id}/default`, {}, getAuthHeader());
      updateSession({ ...userInfo, addresses: data });
      setAddresses(data);
      toast.success('Default address updated');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        
        <ProfileSidebar activeTab="addresses" />

        <div className="flex-1 bg-surface rounded-xl shadow-md border border-accent-gold/10 p-6 md:p-8 flex flex-col gap-8">
          <Link to="/account" className="md:hidden flex items-center gap-2 text-accent-gold font-semibold hover:text-accent-gold-hover transition-colors mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            Back to Profile
          </Link>
          <div className="flex justify-between items-center border-b border-accent-gold/10 pb-4">
            <h2 className="text-2xl font-bold text-text-primary">Manage Addresses</h2>
            {!isFormOpen && (
              <button 
                onClick={() => openForm()}
                className="bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-bold py-2 px-4 rounded transition-colors text-sm"
              >
                + Add New Address
              </button>
            )}
          </div>


          {isFormOpen ? (
            <form onSubmit={submitHandler} className="flex flex-col gap-6 bg-bg-base p-6 rounded border border-accent-gold/20">
              <h3 className="text-xl font-bold text-accent-gold">{editingId ? 'Edit Address' : 'Add New Address'}</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Address Label (e.g. Home, Work)" value={label} onChange={(e) => setLabel(e.target.value)} required className="px-4 py-3 bg-surface border border-accent-gold/20 rounded focus:outline-none focus:border-accent-gold text-text-primary" />
                <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required className="px-4 py-3 bg-surface border border-accent-gold/20 rounded focus:outline-none focus:border-accent-gold text-text-primary" />
                
                <input type="text" placeholder="Street Address" value={street} onChange={(e) => setStreet(e.target.value)} required className="px-4 py-3 bg-surface border border-accent-gold/20 rounded focus:outline-none focus:border-accent-gold text-text-primary sm:col-span-2" />
                
                <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required className="px-4 py-3 bg-surface border border-accent-gold/20 rounded focus:outline-none focus:border-accent-gold text-text-primary" />
                <input type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} required className="px-4 py-3 bg-surface border border-accent-gold/20 rounded focus:outline-none focus:border-accent-gold text-text-primary" />
                <input type="text" placeholder="Postal / Zip Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required className="px-4 py-3 bg-surface border border-accent-gold/20 rounded focus:outline-none focus:border-accent-gold text-text-primary" />
                <input type="text" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} required className="px-4 py-3 bg-surface border border-accent-gold/20 rounded focus:outline-none focus:border-accent-gold text-text-primary" />
              </div>

              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="accent-accent-gold w-4 h-4" />
                <span className="text-text-primary text-sm">Make this my default address</span>
              </label>

              <div className="flex gap-4 pt-4 border-t border-accent-gold/10">
                <button type="submit" disabled={loading} className="bg-accent-gold hover:bg-accent-gold-hover text-bg-base font-bold py-2 px-6 rounded transition-colors">
                  {loading ? 'Saving...' : 'Save Address'}
                </button>
                <button type="button" onClick={closeForm} className="text-accent-gold hover:underline font-bold py-2 px-4">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-4">
              {addresses.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-text-secondary mb-4">No saved addresses found.</p>
                </div>
              ) : (
                addresses.map((address) => (
                  <div key={address._id} className={`p-4 rounded border ${address.isDefault ? 'border-accent-gold bg-accent-gold/5' : 'border-accent-gold/20 bg-bg-base'} relative flex flex-col sm:flex-row justify-between gap-4`}>
                    
                    {address.isDefault && (
                      <span className="absolute top-0 right-0 bg-accent-gold text-bg-base text-xs font-bold px-2 py-1 rounded-bl rounded-tr">
                        DEFAULT
                      </span>
                    )}
                    
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-surface text-accent-gold text-xs font-bold px-2 py-1 rounded border border-accent-gold/20 uppercase tracking-widest">{address.label}</span>
                        <span className="text-text-primary font-bold">{address.phone}</span>
                      </div>
                      <p className="text-text-secondary text-sm">
                        {address.street}, {address.city}, {address.state} {address.postalCode}, {address.country}
                      </p>
                    </div>

                    <div className="flex sm:flex-col justify-end gap-3 mt-2 sm:mt-0">
                      <button onClick={() => openForm(address)} className="text-accent-gold hover:underline text-sm font-bold text-right">Edit</button>
                      <button onClick={() => deleteHandler(address._id)} className="text-red-400 hover:text-red-300 hover:underline text-sm font-bold text-right">Delete</button>
                      {!address.isDefault && (
                        <button onClick={() => setAsDefaultHandler(address._id)} className="text-text-secondary hover:text-accent-gold text-sm transition-colors text-right mt-auto">Set Default</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AddressScreen;
