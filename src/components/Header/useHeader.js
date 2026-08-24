import { useState, useEffect, useRef } from 'react';

/**
 * Owns every piece of shared Header state + side-effects.
 * Consumed only by Header.jsx.
 */
export function useHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const searchInputRef = useRef(null);
  const searchBarRef = useRef(null);
  const searchToggleRef = useRef(null);

  const cartItemCount = 0; // replace with real cart state later

  // Auto-focus search input when it opens
  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  // Header appearance on scroll
  useEffect(() => {
    const updateHeaderAppearance = () => setIsScrolled(window.scrollY > 48);
    updateHeaderAppearance();
    window.addEventListener('scroll', updateHeaderAppearance, { passive: true });
    return () => window.removeEventListener('scroll', updateHeaderAppearance);
  }, []);

  // Escape closes everything
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMenuOpen(false);
        setOpenDropdown(null);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Click-outside closes search
  useEffect(() => {
    if (!isSearchOpen) return;

    const handleClickOutsideSearch = (e) => {
      const clickedInsideSearch = searchBarRef.current?.contains(e.target);
      const clickedToggleButton = searchToggleRef.current?.contains(e.target);
      if (!clickedInsideSearch && !clickedToggleButton) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideSearch);
    return () => document.removeEventListener('mousedown', handleClickOutsideSearch);
  }, [isSearchOpen]);

  // Close dropdown when clicking outside
useEffect(() => {
  const handleClickOutside = (e) => {
    // Must also recognise mobile nav items, otherwise the toggle
    // opens and the same click immediately closes it again.
    if (
      !e.target.closest('.desktop-nav-item--dropdown') &&
      !e.target.closest('.mobile-nav-item')
    ) {
      setOpenDropdown(null);
    }
  };
  document.addEventListener('click', handleClickOutside);
  return () => document.removeEventListener('click', handleClickOutside);
}, []);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);
  const toggleSearch = () => setIsSearchOpen((prev) => !prev);
  const closeSearch = () => setIsSearchOpen(false);

  const toggleDropdown = (label) => {
    setOpenDropdown((prev) => (prev === label ? null : label));
  };
  const closeDropdown = () => setOpenDropdown(null);

  const handleSearchSubmit = () => {
    // Placeholder for future search API / route integration
    console.log('Search triggered:', searchQuery);
  };

  return {
    // menu
    isMenuOpen,
    toggleMenu,
    closeMenu,
    // search
    isSearchOpen,
    toggleSearch,
    closeSearch,
    searchQuery,
    setSearchQuery,
    searchInputRef,
    searchBarRef,
    searchToggleRef,
    handleSearchSubmit,
    // dropdown
    openDropdown,
    toggleDropdown,
    closeDropdown,
    // scroll
    isScrolled,
    // misc
    cartItemCount,
  };
}