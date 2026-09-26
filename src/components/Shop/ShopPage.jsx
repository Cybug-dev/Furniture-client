import { Link, useSearchParams } from 'react-router';
import Header from '../Header/Header.jsx';
import Footer from '../Footer/Footer.jsx';
import Products from '../Products/Products.jsx';
import MoreToExplore from '../Products/MoreToExplore.jsx';
import { PRODUCT_CATEGORIES } from '../Products/product-categories.js';
import './ShopPage.scss';

const allowedCategories = new Set(PRODUCT_CATEGORIES.map((item) => item.value));

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedCategory = searchParams.get('category') || '';
  const category = allowedCategories.has(requestedCategory) ? requestedCategory : '';

  const updateCategory = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('category', value); else next.delete('category');
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="shop-page">
      <Header />
      <main>
        <section className="shop-page__hero">
          <div><h1>Shop Our Collection</h1><p>Modern furniture for every space, style, and budget.</p></div>
        </section>
        <nav className="shop-page__crumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><strong>Shop</strong></nav>
        <Products variant="shop" initialCategory={category} onCategoryChange={updateCategory} />
        <MoreToExplore />
      </main>
      <Footer />
    </div>
  );
}
