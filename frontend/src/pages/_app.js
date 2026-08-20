import { Inter } from 'next/font/google';
import { AuthProvider } from '../features/auth/AuthContext';
import { WishlistProvider } from '../features/wishlist/WishlistContext';
import '../styles/globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

function MyApp({ Component, pageProps }) {
  return (
    <div className={inter.className}>
      <AuthProvider>
        <WishlistProvider>
          <Component {...pageProps} />
        </WishlistProvider>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </div>
  );
}

export default MyApp;