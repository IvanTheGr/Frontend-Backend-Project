import { useQuery } from '@tanstack/react-query';
import {
  fetchProducts,
  searchProducts,
  fetchProductsByCategory,
  fetchCategories,
} from '../api/products';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 30 * 60 * 1000,
  });
};

export const useProductsWithFilters = (
  searchQuery: string,
  category: string,
  limit: number = 100,
  skip: number = 0
) => {
  return useQuery({
    queryKey: ['products', searchQuery, category, limit, skip],
    queryFn: async () => {
      if (searchQuery.length > 0) {
        return searchProducts(searchQuery, limit, skip);
      }
      if (category.length > 0) {
        return fetchProductsByCategory(category, limit, skip);
      }
      return fetchProducts(limit, skip);
    },
    staleTime: 5 * 60 * 1000,
  });
};