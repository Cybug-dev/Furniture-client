import Header from './components/Header/Header'
import Hero from './components/Hero/Hero'
import Browse from './components/Browse/Browse'
import ShareSetup from './textcomponents/ShareSetup/ShareSetup'
import FeatureBanner from "./components/FeatureBanner/FeatureBanner";
import FlashSale from './components/FlashSale';
import './App.css'
import Carousel from './components/Carousel/Carousel'
import Footer from './components/Footer/Footer';

function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="main-content">
        <Hero />
        <Browse />
        <Carousel/>
        <FeatureBanner />
        <ShareSetup />
        <FlashSale />
        <Footer />
      </main>
    </div>
  )
}

export default App
