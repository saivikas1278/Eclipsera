import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const shippingSchema = z.object({
  name: z.string().min(2, 'Full Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  postalCode: z.string().min(4, 'Postal code must be at least 4 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
});

const ShippingScreen = () => {
  const { shippingAddress, saveShippingAddress, cartItems, userInfo } = useContext(StoreContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const { register, handleSubmit, setValue, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(shippingSchema),
    mode: 'onTouched',
    defaultValues: {
      name: shippingAddress.name || userInfo?.name || '',
      email: shippingAddress.email || userInfo?.email || '',
      address: shippingAddress.address || '',
      city: shippingAddress.city || '',
      state: shippingAddress.state || '',
      postalCode: shippingAddress.postalCode || '',
      country: shippingAddress.country || '',
      phone: shippingAddress.phone || '',
    }
  });

  const submitHandler = (dataForm) => {
    saveShippingAddress(dataForm);
    navigate('/placeorder');
  };

  const autofillAddress = (address) => {
    setValue('address', address.street);
    setValue('city', address.city);
    setValue('state', address.state);
    setValue('postalCode', address.postalCode);
    setValue('country', address.country);
    setValue('phone', address.phone);
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh] animate-fade-in py-8">
      <div className="w-full max-w-xl bg-surface/50 backdrop-blur-md p-8 sm:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-accent-gold/20">
        <h1 className="text-3xl font-serif font-extrabold text-text-primary mb-2 text-center">Shipping Details</h1>
        <p className="text-text-secondary text-sm text-center mb-8">Where should we send your luxury pieces?</p>
        
        {userInfo?.addresses?.length > 0 && (
          <div className="mb-8">
            <label className="block text-sm font-semibold text-text-primary/80 mb-3">Saved Addresses</label>
            <div className="flex gap-4 overflow-x-auto snap-x hide-scrollbar pb-2">
              {userInfo.addresses.map((addr) => (
                <div 
                  key={addr._id}
                  onClick={() => autofillAddress(addr)}
                  className="p-4 border border-accent-gold/20 rounded-xl cursor-pointer hover:border-accent-gold transition-colors bg-surface min-w-[200px] snap-start flex-shrink-0"
                >
                  <p className="font-bold text-sm font-serif">{addr.label}</p>
                  <p className="text-xs text-text-secondary mt-1 truncate">{addr.street}, {addr.city}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-primary/80 mb-2">Full Name</label>
              <input
                type="text"
                className={`w-full px-5 py-4 rounded-xl bg-surface border ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-accent-gold/20 focus:ring-accent-gold'} focus:ring-2 outline-none transition-all duration-300`}
                placeholder="Full Name"
                {...register('name')}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-primary/80 mb-2">Email Address</label>
              <input
                type="email"
                className={`w-full px-5 py-4 rounded-xl bg-surface border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-accent-gold/20 focus:ring-accent-gold'} focus:ring-2 outline-none transition-all duration-300`}
                placeholder="Email Address"
                {...register('email')}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary/80 mb-2">Address</label>
            <input
              type="text"
              className={`w-full px-5 py-4 rounded-xl bg-surface border ${errors.address ? 'border-red-500 focus:ring-red-500' : 'border-accent-gold/20 focus:ring-accent-gold'} focus:ring-2 outline-none transition-all duration-300`}
              placeholder="Enter street address"
              {...register('address')}
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary/80 mb-2">City</label>
            <input
              type="text"
              className={`w-full px-5 py-4 rounded-xl bg-surface border ${errors.city ? 'border-red-500 focus:ring-red-500' : 'border-accent-gold/20 focus:ring-accent-gold'} focus:ring-2 outline-none transition-all duration-300`}
              placeholder="Enter city"
              {...register('city')}
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
            <label className="block text-sm font-semibold text-text-primary/80 mb-2">State</label>
            <input
              type="text"
              className={`w-full px-5 py-4 rounded-xl bg-surface border ${errors.state ? 'border-red-500 focus:ring-red-500' : 'border-accent-gold/20 focus:ring-accent-gold'} focus:ring-2 outline-none transition-all duration-300`}
              placeholder="State/Province"
              {...register('state')}
            />
            {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
            </div>
            <div>
            <label className="block text-sm font-semibold text-text-primary/80 mb-2">Postal Code</label>
            <input
              type="text"
              className={`w-full px-5 py-4 rounded-xl bg-surface border ${errors.postalCode ? 'border-red-500 focus:ring-red-500' : 'border-accent-gold/20 focus:ring-accent-gold'} focus:ring-2 outline-none transition-all duration-300`}
              placeholder="Zip/Postal"
              {...register('postalCode')}
            />
            {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
            <label className="block text-sm font-semibold text-text-primary/80 mb-2">Country</label>
            <input
              type="text"
              className={`w-full px-5 py-4 rounded-xl bg-surface border ${errors.country ? 'border-red-500 focus:ring-red-500' : 'border-accent-gold/20 focus:ring-accent-gold'} focus:ring-2 outline-none transition-all duration-300`}
              placeholder="Country"
              {...register('country')}
            />
            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
            </div>
            <div>
            <label className="block text-sm font-semibold text-text-primary/80 mb-2">Phone</label>
            <input
              type="tel"
              className={`w-full px-5 py-4 rounded-xl bg-surface border ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-accent-gold/20 focus:ring-accent-gold'} focus:ring-2 outline-none transition-all duration-300`}
              placeholder="Phone number"
              {...register('phone')}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className="w-full bg-accent-gold hover:bg-accent-gold-hover text-white font-bold py-4 rounded-xl shadow-[0_8px_20px_rgba(212,175,55,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_25px_rgba(212,175,55,0.4)] mt-4 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
          >
            Continue to Payment
          </button>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-6 mt-8 pt-6 border-t border-accent-gold/10 text-text-secondary">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <span className="text-xs font-medium uppercase tracking-wider">SSL Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              <span className="text-xs font-medium uppercase tracking-wider">Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              <span className="text-xs font-medium uppercase tracking-wider">Easy Returns</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShippingScreen;
