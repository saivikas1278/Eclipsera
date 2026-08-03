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

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) return "Please confirm your password.";
  if (password !== confirmPassword) return "Passwords do not match. Please re-enter.";
  return null;
};

export interface PasswordStrength {
  score: number; // 0 to 4
  label: 'Weak' | 'Fair' | 'Strong' | 'Excellent';
  color: string; // Tailwind color class
  percentage: number;
}

export const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) return { score: 0, label: 'Weak', color: 'bg-zinc-300', percentage: 0 };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[@$!%*?&]/.test(password)) score += 1;

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', percentage: 25 };
  if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500', percentage: 50 };
  if (score === 3) return { score: 3, label: 'Strong', color: 'bg-emerald-500', percentage: 75 };
  return { score: 4, label: 'Excellent', color: 'bg-gold-500', percentage: 100 };
};

export const validateFullName = (name: string): string | null => {
  const trimmed = name.trim();
  if (!trimmed) return "This field cannot be left blank.";
  if (trimmed.length < 2) return "Full Name must be at least 2 characters long.";
  const nameRegex = /^[a-zA-Z\s-]+$/;
  if (!nameRegex.test(trimmed)) return "Full Name can only contain letters, spaces, and hyphens.";
  return null;
};
