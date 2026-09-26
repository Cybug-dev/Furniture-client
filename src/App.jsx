import Header from './components/Header/Header'
import Hero from './components/Hero/Hero'
import Browse from './components/Browse/Browse'
import ShareSetup from './textcomponents/ShareSetup/ShareSetup'
import FeatureBanner from "./components/FeatureBanner/FeatureBanner"
import FlashSale from './components/FlashSale'
import Carousel from './components/Carousel/Carousel'
import Products from './components/Products/Products'
import ShopPage from './components/Shop/ShopPage'
import ProductDetail from './components/ProductsDetails/ProductDetail'
import Footer from './components/Footer/Footer'
import { AuthPage } from './auth/Auth'
import FirstVisitExperience from './components/FirstVisit/FirstVisitExperience'
import Contact from './Contact/Contact'
import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router'
import { AccountLayout, Loading } from './commerce/components/CommerceUI'
import CheckoutReminder from './commerce/components/CheckoutReminder'

const CartPage = lazy(() => import('./commerce/pages/CartPage'))
const DeliveryPage = lazy(() => import('./commerce/pages/CheckoutPage').then(m => ({ default: m.DeliveryPage })))
const ReviewPage = lazy(() => import('./commerce/pages/CheckoutPage').then(m => ({ default: m.ReviewPage })))
const CheckoutEntry = lazy(() => import('./commerce/pages/CheckoutPage').then(m => ({ default: m.CheckoutEntry })))
const OrdersPage = lazy(() => import('./commerce/pages/OrdersPage'))
const OrderDetailPage = lazy(() => import('./commerce/pages/OrdersPage').then(m => ({ default: m.OrderDetailPage })))
const ConfirmationPage = lazy(() => import('./commerce/pages/OrdersPage').then(m => ({ default: m.OrderConfirmationPage })))
const NotificationsPage = lazy(() => import('./commerce/pages/NotificationsPage'))
const ProfilePage = lazy(() => import('./commerce/pages/ProfilePage'))

function App() {
  return (
    <>
      <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<AccountLayout />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutEntry />} />
          <Route path="/checkout/delivery" element={<DeliveryPage />} />
          <Route path="/checkout/review" element={<ReviewPage />} />
          <Route path="/order-confirmation/:orderId" element={<ConfirmationPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="/auth" element={<AuthPage />} />

        <Route path="/shop" element={<ShopPage />} />

        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/contact" element={<Contact />} />

        <Route
          path="/"
          element={
            <div className="app-shell">
              <Header />
              <main className="main-content">
                <Hero />
                <Browse />
                <Carousel />
                <Products />
                <FeatureBanner />
                <ShareSetup />
                <FlashSale />
                <Footer />
              </main>
            </div>
          }
        />
      </Routes>
      </Suspense>
      <FirstVisitExperience />
      <CheckoutReminder />
    </>
  )
}

export default App
