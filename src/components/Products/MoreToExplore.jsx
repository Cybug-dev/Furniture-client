import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts } from '../../hooks/apiHooks.js';
import ProductCard from './ProductCard.jsx';
import ProductNotice from './ProductNotice.jsx';
import './MoreToExplore.scss';

const TABS = [
  { id: 'trending', label: 'Trending Products' },
  { id: 'featured', label: 'Featured Products' },
  { id: 'best', label: 'Best Selling' },
  { id: 'new', label: 'New Arrivals' },
];

function shuffle(items, seed) {
  const result = [...items];
  let random = seed;
  for (let index = result.length - 1; index > 0; index -= 1) {
    random = (random * 9301 + 49297) % 233280;
    const swap = Math.floor((random / 233280) * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

function productsFrom(response) {
  if (Array.isArray(response?.data)) return response.data;
  return Array.isArray(response?.data?.items) ? response.data.items : [];
}

export default function MoreToExplore() {
  const [tab, setTab] = useState('trending');
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 233280));
  const [notice, setNotice] = useState(null);
  const query = useProducts({ page: 1, limit: 48 });
  const products = useMemo(() => productsFrom(query.data), [query.data]);

  const visible = useMemo(() => {
    const mixed = shuffle(products, seed);
    if (tab === 'best' && mixed.some((product) => product.salesCount != null || product.soldCount != null)) {
      mixed.sort((a, b) => Number(b.salesCount ?? b.soldCount ?? 0) - Number(a.salesCount ?? a.soldCount ?? 0));
    }
    if (tab === 'new' && mixed.some((product) => product.createdAt)) {
      mixed.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    if (tab === 'trending' && mixed.some((product) => product.rating != null || product.averageRating != null)) {
      mixed.sort((a, b) => Number(b.rating ?? b.averageRating ?? 0) - Number(a.rating ?? a.averageRating ?? 0));
    }
    const candidates = tab === 'featured' ? mixed : mixed.slice(0, 24);
    return shuffle(candidates, seed + 1).slice(0, 8);
  }, [products, tab, seed]);

  const selectTab = (next) => {
    setTab(next);
    setSeed((current) => (current + 7919) % 233280);
  };

  return (
    <section className="more-to-explore" aria-labelledby="more-to-explore-title">
      <div className="more-to-explore__inner">
        <h2 id="more-to-explore-title">More to Explore</h2>
        <p>Discover more furniture pieces handpicked for your style and space.</p>
        <div className="more-to-explore__controls">
          <div className="more-to-explore__tabs" aria-label="Explore products">
            {TABS.map((item) => <button key={item.id} type="button" className={tab === item.id ? 'is-active' : ''} aria-pressed={tab === item.id} onClick={() => selectTab(item.id)}>{item.label}</button>)}
          </div>
          <div className="more-to-explore__arrows">
            <button type="button" aria-label="Show different products" disabled={products.length < 2} onClick={() => setSeed((current) => (current + 233280 - 7919) % 233280)}><ChevronLeft size={20} /></button>
            <button type="button" aria-label="Show more products" disabled={products.length < 2} onClick={() => setSeed((current) => (current + 7919) % 233280)}><ChevronRight size={20} /></button>
          </div>
        </div>
        {query.isPending && <div className="more-to-explore__grid" aria-label="Loading products">{Array.from({ length: 8 }, (_, index) => <div className="products-card products-card--skeleton" key={index} />)}</div>}
        {query.isError && !products.length && <div className="products__message products__message--error" role="alert"><span>{query.error?.message || 'Unable to load products.'}</span><button type="button" onClick={() => query.refetch()}>Retry</button></div>}
        {!query.isPending && visible.length > 0 && <div className="more-to-explore__grid">{visible.map((product) => <ProductCard key={product.id || product.slug} product={product} onNotice={(next) => setNotice({ ...next, id: Date.now() })} />)}</div>}
        {!query.isPending && !query.isError && visible.length === 0 && <p className="products__message">No products available right now.</p>}
      </div>
      <ProductNotice notice={notice} onClose={() => setNotice(null)} />
    </section>
  );
}
