import React, { useMemo, useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  flexRender,
  type SortingState,
} from '@tanstack/react-table';
import type { Product } from '../types/product';
import { useProductsWithFilters, useCategories } from '../hooks/useProducts';
import '../App.css';

const ProductTable: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError, error, refetch, isFetching } =
    useProductsWithFilters(searchQuery, selectedCategory, 100, 0);

  const { data: categories } = useCategories();

  const filteredProducts = useMemo(() => {
    if (!data?.products) return [];
    return data.products.filter((product) => {
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Infinity;
      return product.price >= min && product.price <= max;
    });
  }, [data?.products, minPrice, maxPrice]);

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'thumbnail',
        header: 'Image',
        cell: ({ row }) => (
          <img
            src={row.original.thumbnail}
            alt={row.original.title}
            className="product-img"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'title',
        header: 'Product',
        cell: ({ row }) => (
          <div className="product-info">
            <span className="product-title">{row.original.title}</span>
            <span className="product-brand">{row.original.brand}</span>
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ getValue }) => (
          <span className="category-badge">{String(getValue())}</span>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ getValue }) => (
          <span className="price">${Number(getValue()).toFixed(2)}</span>
        ),
      },
      {
        accessorKey: 'discountPercentage',
        header: 'Discount',
        cell: ({ getValue }) => (
          <span className="discount">-{Number(getValue()).toFixed(1)}%</span>
        ),
      },
      {
        accessorKey: 'rating',
        header: 'Rating',
        cell: ({ getValue }) => (
          <div className="rating">
            <span className="rating-stars">★★★★★</span>
            <span className="rating-value">{Number(getValue()).toFixed(1)}</span>
          </div>
        ),
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ getValue }) => {
          const stock = Number(getValue());
          let className = 'stock in-stock';
          if (stock === 0) className = 'stock out-of-stock';
          else if (stock < 10) className = 'stock low-stock';
          return (
            <span className={className}>
              {stock > 0 ? `${stock} units` : 'Out of Stock'}
            </span>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredProducts,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
  };

  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <h1>📦 Product Catalog</h1>
        <p>Browse and manage your product inventory</p>
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories?.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>

        <input
          type="number"
          className="filter-input"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />

        <input
          type="number"
          className="filter-input"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />

        <button className="btn-clear" onClick={handleClearFilters}>
          Clear Filters
        </button>
      </div>

      {/* Content */}
      <div className="content">
        {/* Loading */}
        {isLoading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Loading products...</p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="error-container">
            <div className="error-icon">❌</div>
            <h3 className="error-title">Failed to Load Products</h3>
            <p className="error-message">{error?.message}</p>
            <button className="btn-retry" onClick={() => refetch()}>
              Try Again
            </button>
          </div>
        )}

        
        {!isLoading && !isError && (
          <>
            
            <div className="results-info">
              <span>
                Found <strong>{filteredProducts.length}</strong> products
              </span>
              {isFetching && <div className="fetching-badge">Updating...</div>}
            </div>

           
            {filteredProducts.length === 0 ? (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3>No Products Found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <>
                
                <div className="table-wrapper">
                  <table className="product-table">
                    <thead>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              <span className="sort-icon">
                                {{
                                  asc: '↑',
                                  desc: '↓',
                                }[header.column.getIsSorted() as string] ?? ''}
                              </span>
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                
                <div className="pagination">
                  <div className="pagination-info">
                    Showing{' '}
                    <strong>
                      {pageIndex * table.getState().pagination.pageSize + 1}
                    </strong>{' '}
                    to{' '}
                    <strong>
                      {Math.min(
                        (pageIndex + 1) * table.getState().pagination.pageSize,
                        filteredProducts.length
                      )}
                    </strong>{' '}
                    of <strong>{filteredProducts.length}</strong> products
                  </div>

                  <div className="pagination-controls">
                    <button
                      className="pagination-btn"
                      onClick={() => table.setPageIndex(0)}
                      disabled={!table.getCanPreviousPage()}
                    >
                      ««
                    </button>
                    <button
                      className="pagination-btn"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      ‹
                    </button>

                    <div className="pagination-pages">
                      {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                        let pageNum = i;
                        if (pageCount > 5) {
                          if (pageIndex < 3) pageNum = i;
                          else if (pageIndex > pageCount - 4)
                            pageNum = pageCount - 5 + i;
                          else pageNum = pageIndex - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            className={`page-btn ${pageIndex === pageNum ? 'active' : ''}`}
                            onClick={() => table.setPageIndex(pageNum)}
                          >
                            {pageNum + 1}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      className="pagination-btn"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      ›
                    </button>
                    <button
                      className="pagination-btn"
                      onClick={() => table.setPageIndex(pageCount - 1)}
                      disabled={!table.getCanNextPage()}
                    >
                      »»
                    </button>
                  </div>

                  <select
                    className="page-size-select"
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                  >
                    {[5, 10, 20, 30, 50].map((size) => (
                      <option key={size} value={size}>
                        Show {size}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductTable;