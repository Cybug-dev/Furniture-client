import { useCallback, useEffect, useMemo, useState } from 'react';
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
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState('featured');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);

  const showNotice = useCallback((nextNotice) => setNotice({ ...nextNotice, id: Date.now() }), []);
  const closeNotice = useCallback(() => setNotice(null), []);
  const unavailable = useCallback((message) => showNotice({ type: 'info', message }), [showNotice]);

  useEffect(() => { setCategory(initialCategory); }, [initialCategory]);

  const selectCategory = useCallback((value) => {
    setCategory(value);
    setFiltersOpen(false);
    onCategoryChange?.(value);
  }, [onCategoryChange]);

  const loadProducts = useCallback(async ({ nextPage = 1, append = false } = {}) => {
    if (append) setLoadingMore(true); else setLoading(true);
    setError('');
    try {
      const response = await getProducts({ page: nextPage, limit: pageSize, ...(category ? { category } : {}) });
      const payload = normalizeProductsResponse(response, nextPage);
      setItems((current) => append ? [...current, ...payload.items] : payload.items);
      setPage(payload.page);
      setTotal(payload.total);
      setPages(payload.pages);
    } catch (requestError) {
      setError(requestError?.message || 'Unable to load products. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category, pageSize]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const sortedItems = useMemo(() => {
    const next = [...items];
    if (sort === 'price-low') next.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === 'price-high') next.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === 'name') next.sort((a, b) => a.name.localeCompare(b.name));
    return next;
  }, [items, sort]);

  const sortControl = <label className="products__sort">Sort by:<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Best selling</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name</option></select></label>;
  const grid = <>
    {loading && <div className="products__grid" aria-label="Loading products">{Array.from({ length: pageSize }).map((_, index) => <div className="products-card products-card--skeleton" key={index} />)}</div>}
    {!loading && error && <div className="products__message products__message--error" role="alert"><span>{error}</span><button type="button" onClick={() => loadProducts()}>Retry</button></div>}
    {!loading && !error && sortedItems.length === 0 && <p className="products__message">No products found in this category.</p>}
    {!loading && sortedItems.length > 0 && <><div className="products__grid">{sortedItems.map((product) => <ProductCard key={product.id || product.slug} product={product} onNotice={showNotice} />)}</div>{page < pages && <button className="products__show-more" type="button" onClick={() => loadProducts({ nextPage: page + 1, append: true })} disabled={loadingMore}>{loadingMore ? 'Loading…' : 'Show More'}</button>}</>}
  </>;

  return (
    <section id="products" className={`products products--${variant}`} aria-labelledby="products-title">
      <div className="products__inner">
        {!isShop && <header className="products__heading"><div><h2 id="products-title">Products</h2><p>Discover quality furniture for every space.</p></div>{sortControl}</header>}
        {!isShop && <div className="products__toolbar"><div className="products__categories" aria-label="Product categories">{PRODUCT_CATEGORIES.map((item) => <button key={item.label} type="button" className={category === item.value ? 'is-active' : ''} onClick={() => selectCategory(item.value)}>{item.label.replace(' Products', '')}</button>)}</div><button className="products__filter" type="button" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={17} /> Filters</button></div>}

        {isShop ? <div className="products__shop-layout">
          <aside className="products__sidebar" aria-label="Product filters"><FilterContent category={category} selectCategory={selectCategory} includeMocks unavailable={unavailable} /></aside>
          <div className="products__catalog"><div className="products__catalog-toolbar"><button className="products__filter products__filter--mobile" type="button" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={16} /> Filters</button><strong id="products-title">{total} products found</strong>{sortControl}</div>{grid}</div>
        </div> : <><div className="products__result-row"><strong>{total ? `${total} products found` : 'Products'}</strong></div>{grid}</>}
      </div>

      {filtersOpen && <div className="products-drawer" role="dialog" aria-modal="true" aria-label="Product filters"><button className="products-drawer__backdrop" type="button" aria-label="Close filters" onClick={() => setFiltersOpen(false)} /><aside><header><h2>Filters</h2><button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters"><X size={20} /></button></header><FilterContent category={category} selectCategory={selectCategory} includeMocks={isShop} unavailable={unavailable} /></aside></div>}
      <ProductNotice notice={notice} onClose={closeNotice} />
    </section>
  );
}
