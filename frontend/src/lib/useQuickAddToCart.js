import { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { customerAPI } from '../services/api';
import { useAuth } from '../features/auth/AuthContext';

// Product cards only know a product id, but the cart API needs a
// variantId, so "quick add" fetches the product's first variant and adds
// that. Used by the category/listing cards that show an inline
// "Add to Cart" button (the product detail page lets shoppers pick a
// specific variant instead).
export function useQuickAddToCart() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [loadingId, setLoadingId] = useState(null);

  const addToCart = async (product) => {
    if (!isAuthenticated) {
      toast.info('Please log in to add items to your cart');
      router.push('/auth/login');
      return;
    }
    if (product.id < 0) {
      toast.info('This is a sample item — connect the backend to purchase it.');
      return;
    }

    setLoadingId(product.id);
    try {
      const variantsRes = await customerAPI.getVariants(product.id);
      const variants = variantsRes.data?.data || [];
      if (variants.length === 0) {
        toast.error('This product has no purchasable option yet.');
        return;
      }
      await customerAPI.addToCart({ variantId: variants[0].id, quantity: 1 });
      toast.success(`${product.name} added to cart`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to cart');
    } finally {
      setLoadingId(null);
    }
  };

  return { addToCart, loadingId };
}
