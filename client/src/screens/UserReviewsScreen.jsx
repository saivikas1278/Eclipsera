import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';
import ProfileSidebar from '../components/ProfileSidebar';

const UserReviewsScreen = () => {
  const { userInfo } = useContext(StoreContext);
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchReviews = async () => {
      try {
        setLoading(true);
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        };
        const { data } = await axios.get('/api/products/my-reviews', config);
        setReviews(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [navigate, userInfo]);

  // Helper function to render stars
  const renderStars = (rating) => {
    return (
      <div className="flex text-accent-gold">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg key={star} className={`w-4 h-4 ${star <= rating ? 'fill-current' : 'text-accent-gold/30'}`} viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-bg-base py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        
        <ProfileSidebar activeTab="reviews" />

        <div className="flex-1 bg-surface rounded-xl shadow-md border border-accent-gold/10 p-6 md:p-8 flex flex-col gap-8">
          <Link to="/account" className="md:hidden flex items-center gap-2 text-accent-gold font-semibold mb-2 hover:text-accent-gold-hover transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            Back to Profile
          </Link>
          <div className="border-b border-accent-gold/10 pb-4">
            <h2 className="text-2xl font-bold text-text-primary">My Reviews & Ratings</h2>
            <p className="text-text-secondary mt-1">You have reviewed {reviews.length} {reviews.length === 1 ? 'item' : 'items'}</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-gold"></div>
            </div>
          ) : error ? (
            <div className="bg-red-900/30 text-red-400 p-3 rounded">{error}</div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg className="w-24 h-24 text-accent-gold/30 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <h3 className="text-xl font-bold text-text-primary mb-2">No reviews yet</h3>
              <p className="text-text-secondary max-w-md mb-8">You haven't left any reviews or ratings. Share your thoughts on products you've purchased!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {reviews.map((review) => (
                <div key={review._id} className="bg-bg-base border border-accent-gold/20 rounded-lg p-5 flex flex-col sm:flex-row gap-6">
                  
                  {/* Product Image */}
                  <Link to={`/product/${review.productId}`} className="w-24 h-24 flex-shrink-0 bg-white rounded overflow-hidden border border-accent-gold/10 hidden sm:block">
                    <img src={review.productImage} alt={review.productName} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </Link>

                  {/* Review Content */}
                  <div className="flex-1 flex flex-col">
                    <Link to={`/product/${review.productId}`} className="font-bold text-text-primary text-lg hover:text-accent-gold transition-colors font-serif mb-2">
                      {review.productName}
                    </Link>
                    
                    <div className="flex items-center gap-4 mb-3">
                      {renderStars(review.rating)}
                      <span className="text-xs text-text-secondary">{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>

                    <p className="text-text-primary text-sm italic border-l-2 border-accent-gold/30 pl-3">
                      "{review.comment}"
                    </p>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserReviewsScreen;
