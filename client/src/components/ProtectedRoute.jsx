import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ accessToken, children }) => {
  const location = useLocation();

  if (!accessToken) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;