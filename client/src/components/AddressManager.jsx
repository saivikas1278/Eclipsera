import { useState, useContext } from 'react';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';

const AddressManager = () => {
  const { userInfo, updateSession } = useContext(StoreContext);
  const addresses = userInfo?.addresses || [];

  const [isEditing, setIsEditing] = useState(false);
  const [currentAddressId, setCurrentAddressId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    label: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    isDefault: false,
  });

  const resetForm = () => {
    setFormData({
      label: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      phone: '',
      isDefault: false,
    });
    setIsEditing(false);
    setCurrentAddressId(null);
    setError(null);
  };

  const handleEditClick = (address) => {
    setFormData({
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault,
    });
    setCurrentAddressId(address._id);
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const getConfig = () => ({
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userInfo.token}`,
    },
  });

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let data;
      if (currentAddressId) {
        // Update existing address
        const res = await axios.put(`/api/users/addresses/${currentAddressId}`, formData, getConfig());
        data = res.data;
        setSuccess('Address updated successfully!');
      } else {
        // Add new address
        const res = await axios.post('/api/users/addresses', formData, getConfig());
        data = res.data;
        setSuccess('Address added successfully!');
      }

      // Backend returns the updated addresses array. Merge it with existing userInfo.
      updateSession({ ...userInfo, addresses: data });
      resetForm();
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

  const deleteHandler = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const { data } = await axios.delete(`/api/users/addresses/${addressId}`, getConfig());
        updateSession({ ...userInfo, addresses: data });
        setSuccess('Address deleted successfully!');
      } catch (err) {
        setError(
          err.response && err.response.data.message
            ? err.response.data.message
            : err.message
        );
      }
    }
  };

  const setDefaultHandler = async (addressId) => {
    try {
      const { data } = await axios.put(`/api/users/addresses/${addressId}/default`, {}, getConfig());
      updateSession({ ...userInfo, addresses: data });
      setSuccess('Default address updated!');
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-serif text-text-primary">Saved Addresses</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-accent-gold hover:bg-accent-gold-hover text-white font-bold py-2 px-6 rounded-xl shadow-md transition-all text-sm"
          >
            + Add New Address
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
          {success}
        </div>
      )}

      {/* --- ADD/EDIT FORM --- */}
      {isEditing && (
        <div className="bg-transparent p-6 sm:p-8 rounded-2xl border border-accent-gold/20 shadow-sm mb-8">
          <h3 className="text-xl font-bold font-serif text-text-primary mb-6">
            {currentAddressId ? 'Edit Address' : 'Add a New Address'}
          </h3>
          <form onSubmit={submitHandler} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">Address Label (e.g., Home, Work)</label>
                <input type="text" name="label" value={formData.label} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-surface border border-accent-gold/20 focus:ring-2 focus:ring-accent-gold outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">Phone Number</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-surface border border-accent-gold/20 focus:ring-2 focus:ring-accent-gold outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-text-primary mb-1">Street Address</label>
                <input type="text" name="street" value={formData.street} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-surface border border-accent-gold/20 focus:ring-2 focus:ring-accent-gold outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-surface border border-accent-gold/20 focus:ring-2 focus:ring-accent-gold outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">State / Province</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-surface border border-accent-gold/20 focus:ring-2 focus:ring-accent-gold outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">Postal / Zip Code</label>
                <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-surface border border-accent-gold/20 focus:ring-2 focus:ring-accent-gold outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">Country</label>
                <input type="text" name="country" value={formData.country} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl bg-surface border border-accent-gold/20 focus:ring-2 focus:ring-accent-gold outline-none" />
              </div>
            </div>

            <div className="flex items-center mt-4">
              <input type="checkbox" id="isDefault" name="isDefault" checked={formData.isDefault} onChange={handleChange} className="w-5 h-5 text-accent-gold focus:ring-accent-gold border-gray-300 rounded accent-[#E64A19]" />
              <label htmlFor="isDefault" className="ml-3 text-sm font-medium text-text-primary">Set as default address</label>
            </div>

            <div className="flex gap-4 pt-4 border-t border-accent-gold/20 mt-6">
              <button type="submit" disabled={loading} className="bg-accent-gold hover:bg-accent-gold-hover text-white font-bold py-3 px-8 rounded-xl shadow-sm transition-all disabled:opacity-70">
                {loading ? 'Saving...' : 'Save Address'}
              </button>
              <button type="button" onClick={resetForm} className="bg-surface hover:bg-gray-50 text-text-primary border border-accent-gold/20 font-bold py-3 px-8 rounded-xl transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- ADDRESSES GRID --- */}
      {!isEditing && addresses.length === 0 && (
        <div className="text-center py-12 bg-transparent rounded-2xl border border-accent-gold/20">
          <svg className="mx-auto h-12 w-12 text-[#EFEBE4] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <h3 className="text-lg font-bold text-text-primary mb-2 font-serif">No saved addresses</h3>
          <p className="text-text-secondary mb-6">Add an address to checkout faster next time.</p>
        </div>
      )}

      {!isEditing && addresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div key={address._id} className={`bg-surface rounded-2xl p-6 shadow-sm border ${address.isDefault ? 'border-accent-gold ring-1 ring-accent-gold/20' : 'border-accent-gold/20'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <h4 className="font-bold text-text-primary font-serif text-lg">{address.label}</h4>
                  {address.isDefault && (
                    <span className="bg-accent-gold/10 text-accent-gold text-xs font-bold px-2.5 py-1 rounded-md">
                      Default
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-text-primary space-y-1 mb-6 text-sm">
                <p>{address.street}</p>
                <p>{address.city}, {address.state} {address.postalCode}</p>
                <p>{address.country}</p>
                <p className="text-text-secondary mt-3">📞 {address.phone}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-accent-gold/20">
                <button onClick={() => handleEditClick(address)} className="text-sm font-semibold text-text-primary hover:text-accent-gold transition-colors">
                  Edit
                </button>
                <span className="text-[#EFEBE4]">|</span>
                <button onClick={() => deleteHandler(address._id)} className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors">
                  Delete
                </button>
                
                {!address.isDefault && (
                  <>
                    <span className="text-[#EFEBE4]">|</span>
                    <button onClick={() => setDefaultHandler(address._id)} className="text-sm font-semibold text-accent-gold hover:text-accent-gold transition-colors">
                      Set as Default
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressManager;
