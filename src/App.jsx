import Header from './components/Header/Header'
import Hero from './components/Hero/Hero'
import Browse from './components/Browse/Browse'
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
      </main>
    </div>
  )
}

export default App
