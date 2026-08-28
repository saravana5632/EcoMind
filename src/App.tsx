import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { FarmerDashboard } from './components/farmer/FarmerDashboard';
import { LandlordDashboard } from './components/landlord/LandlordDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { LocationPermissionModal } from './components/common/LocationPermissionModal';
import { ProfileView } from './components/common/ProfileView';
import { LandDetailModal } from './components/farmer/LandDetailModal';
import { UserRole, LandItem } from './types';

const MainApp: React.FC = () => {
  const { user, role, isAuthenticated } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('home');

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState<UserRole>('FARMER');
  const [authIsRegister, setAuthIsRegister] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [selectedLandForDetail, setSelectedLandForDetail] = useState<LandItem | null>(null);

  const handleOpenAuth = (targetRole: UserRole = 'FARMER', isRegister: boolean = false) => {
    setAuthRole(targetRole);
    setAuthIsRegister(isRegister);
    setAuthModalOpen(true);
  };

  const handleNavigate = (view: string) => {
    if (view === 'dashboard' && !isAuthenticated) {
      handleOpenAuth('FARMER', false);
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9f5] text-stone-900 font-sans selection:bg-[#95d5b2] selection:text-[#1b4332]">
      {/* Universal Top Navigation */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onOpenLocationModal={() => setLocationModalOpen(true)}
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {/* VIEW 1: HOME LANDING PAGE */}
        {currentView === 'home' && (
          <LandingPage
            onOpenAuth={handleOpenAuth}
            onOpenLocationModal={() => setLocationModalOpen(true)}
            onExploreLands={() => {
              if (isAuthenticated && role === 'FARMER') {
                setCurrentView('dashboard');
              } else {
                setCurrentView('explore');
              }
            }}
            onSelectLand={(land) => setSelectedLandForDetail(land)}
          />
        )}

        {/* VIEW 2: EXPLORE LANDS (PUBLIC / FARMER DISCOVERY) */}
        {currentView === 'explore' && (
          <FarmerDashboard
            initialTab="explore"
            onOpenLocationModal={() => setLocationModalOpen(true)}
          />
        )}

        {/* VIEW 3: HOW IT WORKS */}
        {currentView === 'how-it-works' && (
          <LandingPage
            onOpenAuth={handleOpenAuth}
            onOpenLocationModal={() => setLocationModalOpen(true)}
            onExploreLands={() => setCurrentView('explore')}
            onSelectLand={(land) => setSelectedLandForDetail(land)}
          />
        )}

        {/* VIEW 4: ROLE DASHBOARDS */}
        {currentView === 'dashboard' && (
          <>
            {role === 'FARMER' && (
              <FarmerDashboard
                initialTab="explore"
                onOpenLocationModal={() => setLocationModalOpen(true)}
              />
            )}
            {role === 'LANDLORD' && <LandlordDashboard initialTab="my-lands" />}
            {role === 'ADMIN' && <AdminDashboard />}
            {!isAuthenticated && (
              <FarmerDashboard
                initialTab="explore"
                onOpenLocationModal={() => setLocationModalOpen(true)}
              />
            )}
          </>
        )}

        {/* VIEW 5: FARMER SUB-VIEWS */}
        {currentView === 'my-requests' && (
          <FarmerDashboard
            initialTab="my-requests"
            onOpenLocationModal={() => setLocationModalOpen(true)}
          />
        )}
        {currentView === 'reserved' && (
          <FarmerDashboard
            initialTab="reserved"
            onOpenLocationModal={() => setLocationModalOpen(true)}
          />
        )}

        {/* VIEW 6: LANDLORD SUB-VIEWS */}
        {currentView === 'my-lands' && <LandlordDashboard initialTab="my-lands" />}
        {currentView === 'add-land' && <LandlordDashboard initialTab="my-lands" />}
        {currentView === 'rental-requests' && <LandlordDashboard initialTab="rental-requests" />}

        {/* VIEW 7: ADMIN SUB-VIEWS */}
        {(currentView === 'admin-analytics' ||
          currentView === 'admin-users' ||
          currentView === 'admin-lands') && <AdminDashboard />}

        {/* VIEW 8: USER PROFILE */}
        {currentView === 'profile' && (
          <ProfileView onOpenLocationModal={() => setLocationModalOpen(true)} />
        )}
      </main>

      {/* Footer */}
      <Footer onOpenAuth={handleOpenAuth} onNavigate={handleNavigate} />

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialRole={authRole}
        initialIsRegister={authIsRegister}
      />

      <LocationPermissionModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />

      <LandDetailModal
        land={selectedLandForDetail}
        isOpen={Boolean(selectedLandForDetail)}
        onClose={() => setSelectedLandForDetail(null)}
        onRentalSuccess={() => {
          if (isAuthenticated && role === 'FARMER') {
            setCurrentView('my-requests');
          }
        }}
      />
    </div>
  );
};

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
