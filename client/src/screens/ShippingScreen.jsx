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
  postalCode: z.string().min(4, 'Postal code must be at least 4 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
});

const ShippingScreen = () => {
  const { shippingAddress, saveShippingAddress, cartItems, userInfo } = useContext(StoreContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const { register, handleSubmit, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(shippingSchema),
    mode: 'onTouched',
    defaultValues: {
      name: shippingAddress.name || userInfo?.name || '',
      email: shippingAddress.email || userInfo?.email || '',
      address: shippingAddress.address || '',
      city: shippingAddress.city || '',
      postalCode: shippingAddress.postalCode || '',
      country: shippingAddress.country || '',
    }
  });

  const submitHandler = (dataForm) => {
    saveShippingAddress(dataForm);
    navigate('/placeorder');
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh] animate-fade-in">
      <div className="w-full max-w-md bg-transparent p-8 sm:p-10 rounded-3xl shadow-sm border border-accent-gold/20">
        <h1 className="text-3xl font-serif font-extrabold text-text-primary mb-8 text-center">Shipping</h1>
        
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
            <label className="block text-sm font-semibold text-text-primary/80 mb-2">Postal Code</label>
            <input
              type="text"
              className={`w-full px-5 py-4 rounded-xl bg-surface border ${errors.postalCode ? 'border-red-500 focus:ring-red-500' : 'border-accent-gold/20 focus:ring-accent-gold'} focus:ring-2 outline-none transition-all duration-300`}
              placeholder="Zip/Postal"
              {...register('postalCode')}
            />
            {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>}
            </div>
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
          </div>
          <button
            type="submit"
            disabled={!isValid}
            className="w-full bg-accent-gold hover:bg-accent-gold-hover text-white font-bold py-4 rounded-xl shadow-md transition-all hover:shadow-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Checkout
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShippingScreen;
