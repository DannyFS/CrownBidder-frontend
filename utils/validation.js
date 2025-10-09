// Email validation
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password validation
export function isValidPassword(password) {
  // At least 8 characters, one uppercase, one lowercase, one number
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return minLength && hasUpperCase && hasLowerCase && hasNumber;
}

export function getPasswordStrength(password) {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
}

// Domain validation
export function isValidDomain(domain) {
  // Basic domain validation
  const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
  return domainRegex.test(domain);
}

// Subdomain validation
export function isValidSubdomain(subdomain) {
  // 3-20 characters, alphanumeric only
  const subdomainRegex = /^[a-z0-9]{3,20}$/i;
  return subdomainRegex.test(subdomain);
}

// Site name validation
export function isValidSiteName(name) {
  // 3-50 characters, alphanumeric with spaces and hyphens
  return name.length >= 3 && name.length <= 50 && /^[a-zA-Z0-9\s-]+$/.test(name);
}

// Bid amount validation
export function isValidBidAmount(amount, minimumBid) {
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount >= minimumBid && numAmount > 0;
}

// File validation
export function isValidImageFile(file, maxSize = 2097152) {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return file && validTypes.includes(file.type) && file.size <= maxSize;
}

// Form validation helpers
export function validateLoginForm(email, password) {
  const errors = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return errors;
}

export function validateSignupForm(formData) {
  const errors = {};

  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(formData.password)) {
    errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
  }

  if (formData.confirmPassword !== formData.password) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!formData.firstName || formData.firstName.length < 2) {
    errors.firstName = 'First name must be at least 2 characters';
  }

  if (!formData.lastName || formData.lastName.length < 2) {
    errors.lastName = 'Last name must be at least 2 characters';
  }

  return errors;
}

export function validateSiteForm(formData) {
  const errors = {};

  if (!formData.name) {
    errors.name = 'Site name is required';
  } else if (!isValidSiteName(formData.name)) {
    errors.name = 'Site name must be 3-50 characters (letters, numbers, spaces, hyphens)';
  }

  if (!formData.customDomain) {
    errors.customDomain = 'Custom domain is required';
  } else if (!isValidDomain(formData.customDomain)) {
    errors.customDomain = 'Please enter a valid domain (e.g., example.com)';
  }

  if (!formData.subdomain) {
    errors.subdomain = 'Subdomain is required';
  } else if (!isValidSubdomain(formData.subdomain)) {
    errors.subdomain = 'Subdomain must be 3-20 characters (letters and numbers only)';
  }

  if (formData.description && formData.description.length > 200) {
    errors.description = 'Description must be less than 200 characters';
  }

  return errors;
}

export function validateAuctionForm(formData) {
  const errors = {};

  if (!formData.title || formData.title.length < 3) {
    errors.title = 'Auction title must be at least 3 characters';
  }

  if (!formData.startTime) {
    errors.startTime = 'Start time is required';
  } else {
    const startDate = new Date(formData.startTime);
    if (startDate < new Date()) {
      errors.startTime = 'Start time must be in the future';
    }
  }

  if (!formData.endTime) {
    errors.endTime = 'End time is required';
  } else if (formData.startTime && formData.endTime) {
    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);
    if (endDate <= startDate) {
      errors.endTime = 'End time must be after start time';
    }
  }

  if (!formData.items || formData.items.length === 0) {
    errors.items = 'At least one auction item is required';
  }

  return errors;
}
