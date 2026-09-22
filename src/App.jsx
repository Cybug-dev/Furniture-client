import Header from './components/Header/Header'
import Hero from './components/Hero/Hero'
import Browse from './components/Browse/Browse'
import ShareSetup from './textcomponents/ShareSetup/ShareSetup'
import FeatureBanner from "./components/FeatureBanner/FeatureBanner"
import FlashSale from './components/FlashSale'
import Carousel from './components/Carousel/Carousel'
import Products from './components/Products/Products'
import Footer from './components/Footer/Footer'
import { AuthPage } from './auth/Auth'
import { AuthSessionGate } from './auth/AuthSessionGate'
import FirstVisitExperience from './components/FirstVisit/FirstVisitExperience'
import { Routes, Route } from 'react-router'

function App() {
  return (
    <AuthSessionGate>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />

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
      <FirstVisitExperience />
    </AuthSessionGate>
  )
}

export default App
