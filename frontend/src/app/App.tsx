import { AuthProvider } from '../contexts/AuthContext';
import HomePage from '../pages/HomePage';

function App() {
  return (
    <AuthProvider>
      <HomePage />
    </AuthProvider>
  );
}

export default App;
