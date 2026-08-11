import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';

const PrivateRoute = () => {
  const { userInfo } = useContext(StoreContext);

  // If user is logged in, render child routes (<Outlet />)
  // Otherwise, kick them back to the login page immediately
  return userInfo ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default PrivateRoute;
