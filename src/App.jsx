import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import Browse from './components/Browse/Browse';
import ShareSetup from './textcomponents/ShareSetup/ShareSetup';
import Footer from './components/Footer/Footer';
import Carousel from './components/Carousel/Carousel';
import './App.css';
import { AuthPage } from './auth/Auth';
import { BrowserRouter, Routes, Route } from 'react-router';

function Home() {
  return (
    <div className="app-shell">
      <Header />

      <main className="main-content">
        <Hero />
        <Browse />
        <Carousel />
        <ShareSetup />
        <Footer />
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;