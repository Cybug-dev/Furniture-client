import Header from './components/Header/Header'
import Hero from './components/Hero/Hero'
import Browse from './components/Browse/Browse'
import ShareSetup from './textcomponents/ShareSetup/ShareSetup'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="main-content">
        <Hero />
        <Browse />
        <ShareSetup />
      </main>
    </div>
  )
}

export default App
