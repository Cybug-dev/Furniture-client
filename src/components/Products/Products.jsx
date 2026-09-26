import { useCallback, useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { getProducts } from '../../api/api.js';
import ProductCard from './ProductCard.jsx';
import ProductNotice from './ProductNotice.jsx';
import { PRODUCT_CATEGORIES } from './product-categories.js';
import './Products.scss';

const MOCK_MATERIAL_FILTERS = ['Wood', 'Fabric', 'Metal', 'Leather'];

function normalizeProductsResponse(response, requestedPage) {
  const documented = response?.data && !Array.isArray(response.data) ? response.data : null;
  const pagination = response?.pagination || {};
  if (Array.isArray(response?.data)) {
    return { items: response.data, page: pagination.page ?? requestedPage, total: pagination.totalProducts ?? response.data.length, pages: pagination.totalPages ?? 1 };
  }
  return { items: Array.isArray(documented?.items) ? documented.items : [], page: documented?.page ?? requestedPage, total: documented?.total ?? 0, pages: documented?.pages ?? 1 };
}

function FilterContent({ category, selectCategory, includeMocks, unavailable }) {
  return (
    <div className="products-filters">
      <section><h3>Categories <ChevronDown size={14} aria-hidden="true" /></h3>{PRODUCT_CATEGORIES.map((item) => <button key={item.label} type="button" className={category === item.value ? 'is-active' : ''} onClick={() => selectCategory(item.value)}>{item.label}</button>)}</section>
      {includeMocks && <>
        <section className="products-filters__price"><h3>Price Range <ChevronDown size={14} aria-hidden="true" /></h3><button type="button" onClick={() => unavailable('Price filtering has not been added yet.')} aria-label="Price range filtering is coming soon"><span className="products-filters__range" aria-hidden="true"><i /><i /></span><span className="products-filters__range-labels"><b>₦0</b><b>₦1,500,000+</b></span></button></section>
        <section><h3>Material <ChevronDown size={14} aria-hidden="true" /></h3>{MOCK_MATERIAL_FILTERS.map((label) => <button className="products-filters__mock" type="button" key={label} onClick={() => unavailable('Material filtering has not been added yet.')}><span aria-hidden="true" />{label}</button>)}</section>
      </>}
    </div>
  );
}

export default function Products({ variant = 'section', initialCategory = '', onCategoryChange }) {
  const isShop = variant === 'shop';
  const pageSize = isShop ? 16 : 15;
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showFloatingFilter, setShowFloatingFilter] = useState(false);
  const [notice, setNotice] = useState(null);

  const productsQuery = useInfiniteQuery({
    queryKey: ['products', 'catalog', category, pageSize],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getProducts({ page: pageParam, limit: pageSize, ...(category ? { category } : {}) }),
    getNextPageParam: (last, all) => {
      const current = normalizeProductsResponse(last, all.length);
      return current.page < current.pages ? current.page + 1 : undefined;
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
  });
  const responses = productsQuery.data?.pages || [];
  const items = responses.flatMap((response, index) => normalizeProductsResponse(response, index + 1).items);
  const total = responses.length ? normalizeProductsResponse(responses[0], 1).total : 0;
  const categoryLabel = PRODUCT_CATEGORIES.find((item) => item.value === category)?.label;
  const resultLabel = `${total} products found${category ? ` in ${categoryLabel}` : ''}`;
  const loading = productsQuery.isPending;
  const loadingMore = productsQuery.isFetchingNextPage;
  const error = productsQuery.error?.message;

  const showNotice = useCallback((nextNotice) => setNotice({ ...nextNotice, id: Date.now() }), []);
  const closeNotice = useCallback(() => setNotice(null), []);
  const unavailable = useCallback((message) => showNotice({ type: 'info', message }), [showNotice]);

  useEffect(() => { setCategory(initialCategory); }, [initialCategory]);

  useEffect(() => {
    const update = () => setShowFloatingFilter(window.scrollY > window.innerHeight);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const selectCategory = useCallback((value) => {
    setCategory(value);
    setFiltersOpen(false);
    onCategoryChange?.(value);
    document.getElementById('products')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'start',
    });
  }, [onCategoryChange]);

  const sortedItems = [...items];
  if (sort === 'price-low') sortedItems.sort((a, b) => Number(a.price) - Number(b.price));
  if (sort === 'price-high') sortedItems.sort((a, b) => Number(b.price) - Number(a.price));
  if (sort === 'name') sortedItems.sort((a, b) => a.name.localeCompare(b.name));

  const sortControl = <label className="products__sort">Sort by:<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Best selling</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name</option></select></label>;
  const grid = <>
    {loading && <div className="products__grid" aria-label="Loading products">{Array.from({ length: pageSize }).map((_, index) => <div className="products-card products-card--skeleton" key={index} />)}</div>}
    {!loading && error && items.length === 0 && <div className="products__message products__message--error" role="alert"><span>{error}</span><button type="button" onClick={() => productsQuery.refetch()}>Retry</button></div>}
    {!loading && !error && sortedItems.length === 0 && <p className="products__message">No products found in this category.</p>}
    {!loading && sortedItems.length > 0 && <><div className="products__grid">{sortedItems.map((product) => <ProductCard key={product.id || product.slug} product={product} onNotice={showNotice} />)}</div>{productsQuery.hasNextPage && <button className="products__show-more" type="button" onClick={() => productsQuery.fetchNextPage()} disabled={loadingMore}>{loadingMore ? 'Loading…' : 'Show More'}</button>}</>}
  </>;

  return (
    <section id="products" className={`products products--${variant}`} aria-labelledby="products-title">
      <div className="products__inner">
        {!isShop && <header className="products__heading"><div><h2 id="products-title">Products</h2><p>Discover quality furniture for every space.</p></div>{sortControl}</header>}
        {!isShop && <div className="products__toolbar"><div className="products__categories" aria-label="Product categories">{PRODUCT_CATEGORIES.map((item) => <button key={item.label} type="button" className={category === item.value ? 'is-active' : ''} onClick={() => selectCategory(item.value)}>{item.label.replace(' Products', '')}</button>)}</div><button className="products__filter" type="button" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={17} /> Filters</button></div>}

        {isShop ? <div className="products__shop-layout">
          <aside className="products__sidebar" aria-label="Product filters"><FilterContent category={category} selectCategory={selectCategory} includeMocks unavailable={unavailable} /></aside>
          <div className="products__catalog"><div className="products__catalog-toolbar"><button className="products__filter products__filter--mobile" type="button" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={16} /> Filters</button><strong id="products-title">{loading ? 'Products' : resultLabel}</strong>{sortControl}</div>{grid}</div>
        </div> : <><div className="products__result-row"><strong>{loading ? 'Products' : resultLabel}</strong></div>{grid}</>}
      </div>

      <button className={`products__floating-filter${showFloatingFilter ? ' is-visible' : ''}`} type="button" onClick={() => setFiltersOpen(true)} aria-label="Open product filters" tabIndex={showFloatingFilter ? 0 : -1}><SlidersHorizontal size={18} aria-hidden="true" /> Filters</button>

      <div className={`products-drawer${filtersOpen ? ' is-open' : ''}`} role="dialog" aria-modal={filtersOpen || undefined} aria-hidden={!filtersOpen} inert={!filtersOpen ? '' : undefined} aria-label="Product filters"><button className="products-drawer__backdrop" type="button" aria-label="Close filters" onClick={() => setFiltersOpen(false)} /><aside><header><h2>Filters</h2><button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters"><X size={20} /></button></header><FilterContent category={category} selectCategory={selectCategory} includeMocks unavailable={unavailable} /></aside></div>
      <ProductNotice notice={notice} onClose={closeNotice} />
    </section>
  );
}
