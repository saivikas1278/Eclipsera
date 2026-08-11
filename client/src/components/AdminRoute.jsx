import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';

const AdminRoute = () => {
  const { userInfo } = useContext(StoreContext);

  // If user exists and is an admin, render the child routes (<Outlet />)
  // Otherwise, kick them back to the login page immediately
  return userInfo && userInfo.isAdmin ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default AdminRoute;
