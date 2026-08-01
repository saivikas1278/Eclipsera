export const validateEmail = (email: string): string | null => {
  const trimmed = email.trim();
  if (!trimmed) return "This field cannot be left blank.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) return "Please enter a valid email address (e.g., name@example.com).";
  return null;
};

export const validatePhone = (phone: string): string | null => {
  const cleanDigits = phone.replace(/\D/g, '');
  if (!cleanDigits) return "This field cannot be left blank.";
  if (cleanDigits.length !== 10) return "Please enter a valid 10-digit mobile number.";
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return "This field cannot be left blank.";
  if (password.length < 8) return "Password must be at least 8 characters long.";
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);
  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    return "Password must be at least 8 characters and include uppercase, lowercase, a number, and a symbol.";
  }
  return null;
};

export const validateFullName = (name: string): string | null => {
  const trimmed = name.trim();
  if (!trimmed) return "This field cannot be left blank.";
  if (trimmed.length < 2) return "Full Name must be at least 2 characters long.";
  const nameRegex = /^[a-zA-Z\s-]+$/;
  if (!nameRegex.test(trimmed)) return "Full Name can only contain letters, spaces, and hyphens.";
  return null;
};
