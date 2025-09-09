
import { AuthProvider } from './contexts/AuthContext';
import WorkingDashboard from './components/WorkingDashboard';


function App() {
  return (
    <AuthProvider>
      <WorkingDashboard />
    </AuthProvider>
  );
}

export default App;