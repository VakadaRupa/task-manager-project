import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="auth-page unauthorized-page">
      <div className="auth-card glass text-center">
        <div className="auth-icon-badge error">
          <ShieldAlert size={36} />
        </div>
        <h1 className="mt-4">Access Denied</h1>
        <p className="mt-2 text-muted">
          You do not have administrative privileges to access this page.
        </p>
        <div className="mt-6">
          <Link to="/dashboard" className="btn btn-primary">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
