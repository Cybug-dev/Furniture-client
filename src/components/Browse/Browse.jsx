import './Browse.scss';
import diningImg from '../../assets/images/dining.png';
import livingImg from '../../assets/images/living.png';
import bedroomImg from '../../assets/images/bedroom.png';

// Renders the browse categories section for the furniture storefront.
const Browse = () => {
  return (
    <section className="browse">
      <div className="browse-heading">
        <h2>Browse</h2>
        <p>Make sure to Browse through our collection and find your perfect piece.</p>
      </div>

      <div className="browse-grid">
        <div className="browse-item">
          <img src={diningImg} alt="Dining" />
          <span className="browse-label">Dining</span>
        </div>

        <div className="browse-item">
          <img src={livingImg} alt="Living" />
          <span className="browse-label">Living</span>
        </div>

        <div className="browse-item">
          <img src={bedroomImg} alt="Bedroom" />
          <span className="browse-label">Bedroom</span>
        </div>
      </div>
    </section>
  );
};

export default Browse;
