import Header from './components/Header/Header'
import Hero from './components/Hero/Hero'
import Browse from './components/Browse/Browse'
import ShareSetup from './textcomponents/ShareSetup/ShareSetup'
import Footer from './components/Footer/Footer';
import './App.css'
import Carousel from './components/Carousel/Carousel'

function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="main-content">
        <Hero />
        <Browse />
        <Carousel/>
        <ShareSetup />
        <Footer />
      </main>
    </div>
  )
}

export default App
