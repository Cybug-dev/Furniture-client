import newSeasonPicks from '../../assets/images/ads/new-season-picks.png';
import refreshYourSpace from '../../assets/images/ads/refresh-your-space.png';
import welcomeHome from '../../assets/images/ads/welcome-home.png';

// /shop is not routed yet. Keep campaign destinations on the real home-page
// product section until a dedicated shop route exists.
export const campaigns = [
  {
    id: 'new-season-picks',
    image: newSeasonPicks,
    alt: 'New Season Picks: a light upholstered chair beside a wooden table and greenery',
    destination: '/#products',
  },
  {
    id: 'refresh-your-space',
    image: refreshYourSpace,
    alt: 'Refresh Your Space: a cream sofa, wooden coffee table, and indoor plants',
    destination: '/#products',
  },
  {
    id: 'welcome-home',
    image: welcomeHome,
    alt: 'Welcome Home: an upholstered lounge chair with green cushions and plants',
    destination: '/#products',
  },
];
