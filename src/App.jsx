import Header from './components/Header/Header'
import Hero from './components/Hero/Hero'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="main-content">
        <Hero />
      </main>
    </div>
  )
}

export default App
