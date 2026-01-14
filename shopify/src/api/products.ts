import type { ProductsResponse } from '../types/product';

const BASE_URL = 'https://dummyjson.com';

export const fetchProducts = async (
  limit: number = 10,
  skip: number = 0
): Promise<ProductsResponse> => {
  const response = await fetch(
    `${BASE_URL}/products?limit=${limit}&skip=${skip}`
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const searchProducts = async (
  query: string,
  limit: number = 10,
  skip: number = 0
): Promise<ProductsResponse> => {
  const response = await fetch(
    `${BASE_URL}/products/search?q=${encodeURIComponent(query)}&limit=${limit}&skip=${skip}`
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const fetchCategories = async (): Promise<string[]> => {
  const response = await fetch(`${BASE_URL}/products/category-list`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const fetchProductsByCategory = async (
  category: string,
  limit: number = 10,
  skip: number = 0
): Promise<ProductsResponse> => {
  const response = await fetch(
    `${BASE_URL}/products/category/${encodeURIComponent(category)}?limit=${limit}&skip=${skip}`
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};