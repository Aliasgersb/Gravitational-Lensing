export const isMobileDevice = () => {
  // Check user agent for mobile devices
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // Mobile device patterns
  const mobilePatterns = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
    /IEMobile/i,
    /Opera Mini/i,
    /Mobile/i
  ];
  
  // Check if user agent matches any mobile pattern
  const isMobileUA = mobilePatterns.some(pattern => pattern.test(userAgent));
  
  // Also check screen width as a fallback (devices with width < 768px are typically mobile)
  const isSmallScreen = window.innerWidth < 768;
  
  // Check for touch support (most mobile devices have touch)
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Consider it mobile if user agent indicates mobile OR if it's a small screen with touch
  return isMobileUA || (isSmallScreen && hasTouchScreen);
};
