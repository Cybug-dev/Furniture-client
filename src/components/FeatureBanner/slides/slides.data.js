// @ts-nocheck

const u = (id, extra = "w=1920&h=1080&fit=crop&q=80") =>
  `https://images.unsplash.com/${id}?${extra}&auto=format`;

/** @type {Array<{id: string, type: 'default' | 'ad' | 'showcase' | 'promo', backgroundUrl: string, content: object}>} */
export const slides = [
  {
    id: "promo-comfortcraft-sofa",
    type: "promo",
    backgroundUrl: u("photo-1540518614846-7eded433c457"),
    content: {
      offer: "25% OFF",
      heading: "ComfortCraft Sofa",
      subtext: "Don't miss our best discount for this month for our subscribers",
      ctaLabel: "Subscribe",
      placeholder: "Email",
      endsAt: null,
    },
  },
  {
    id: "editorial-atelier",
    type: "default",
    backgroundUrl: u("photo-1616486338812-3dadae4b4ace"),
    content: {
      kicker: "New collection",
      heading: "Rooms that feel finished",
      subtext:
        "Quiet palettes, honest materials, and pieces designed to be lived with — not just looked at.",
      ctaLabel: "Explore the collection",
      ctaHref: "#collection",
    },
  },
  {
    id: "ad-lumen-lounge",
    type: "ad",
    backgroundUrl: u("photo-1618221195710-dd6b41faaea6"),
    content: {
      productName: "Lumen Lounge Chair",
      productImage: u("photo-1567538096630-e0c55bd6374c", "w=900&h=1100&fit=crop&q=80"),
      price: 890,
      compareAt: 1180,
      discount: 25,
      badge: "Member exclusive",
      ctaLabel: "Shop Now",
      ctaHref: "#collection",
    },
  },
  {
    id: "showcase-living",
    type: "showcase",
    backgroundUrl: u("photo-1631679706909-1844bbd07221"),
    content: {
      heading: "Featured this week",
      subtext: "Three pieces our stylists keep coming back to.",
      products: [
        {
          name: "Oak Side Table",
          price: 240,
          image: u("photo-1533090481720-856c6e3c1fdc", "w=600&h=600&fit=crop&q=80"),
        },
        {
          name: "Cloud Sectional",
          price: 2140,
          image: u("photo-1555041469-a586c61ea9bc", "w=600&h=600&fit=crop&q=80"),
        },
        {
          name: "Arc Floor Lamp",
          price: 320,
         image: u("photo-1583847268964-b28dc8f51f92", "w=600&h=600&fit=crop&q=80"),
        },
      ],
    },
  },
];

export default slides;
