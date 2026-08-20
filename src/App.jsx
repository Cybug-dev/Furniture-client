import Header from './components/Header/Header'
import Hero from './components/Hero/Hero'
import Browse from './components/Browse/Browse'
import ShareSetup from './textcomponents/ShareSetup/ShareSetup'
import Footer from './components/Footer/Footer';
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="main-content">
        <Hero />
        <Browse />
        <ShareSetup />
        <Footer />
      </main>
    </div>
  )
}

export default App
