import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { ThemeProvider } from './context/ContextProvider/ThemeProvider';
import { DashboardPage, HomePage, LandingPage, LoginPage, SignupPage, NotFoundPage, ProductsPage, ProductDetailsPage, UserProfilePage, DistributorsPage, DistributorDetailsPage, RetailersPage, RetailerDetailsPage, MyCartPage } from './pages';

function AppContent() {
  
  return (
    <div className={`min-h-screen`}>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          
          {/* Public Route */}
          <Route path="/landing" element={<HomePage />} />

          {/* Public Route */}
          <Route path="/" element={<LandingPage />} />

          {/* Protected Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />

          <Route path="/distributors" element={<DistributorsPage />} />
          <Route path="/distributors/:id" element={<DistributorDetailsPage />} />

          <Route path="/retailers" element={<RetailersPage />} />
          <Route path="/retailers/:id" element={<RetailerDetailsPage />} />

          <Route path="/cart" element={<MyCartPage />} />

          {/* No Route */}
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </BrowserRouter>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
