export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  {
    label: 'Shop',
    href: '/shop',
    hasDropdown: true,
    submenu: [
      { label: 'Sofas', href: '/shop?category=sofas' },
      { label: 'Chairs', href: '/shop?category=chairs' },
      { label: 'Tables', href: '/shop?category=tables' },
      { label: 'Beds', href: '/shop?category=beds' },
      { label: 'Storage', href: '/shop?category=storage' },
      { label: 'Lamps', href: '/shop?category=lamps' },
    ],
  },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];
