// validation.js - Form and input validation for the Solo Leveling System

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @return {boolean} True if email is valid
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === "") return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @return {Object} Validation result with status and message
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: "Password is required" };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters",
    };
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number",
    };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }

  // Check for at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one special character",
    };
  }

  return { isValid: true, message: "Password is strong" };
};

/**
 * Validates that passwords match
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @return {boolean} True if passwords match
 */
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

/**
 * Validates username format
 * @param {string} username - Username to validate
 * @return {Object} Validation result with status and message
 */
export const validateUsername = (username) => {
  if (!username || username.trim() === "") {
    return { isValid: false, message: "Username is required" };
  }

  if (username.length < 3) {
    return {
      isValid: false,
      message: "Username must be at least 3 characters",
    };
  }

  if (username.length > 20) {
    return {
      isValid: false,
      message: "Username must be less than 20 characters",
    };
  }

  // Allow only alphanumeric characters and underscores
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      isValid: false,
      message: "Username can only contain letters, numbers, and underscores",
    };
  }

  return { isValid: true, message: "Username is valid" };
};

/**
 * Validates required fields
 * @param {Object} fields - Object with field values
 * @param {Array} requiredFields - Array of required field names
 * @return {Object} Object containing invalid fields
 */
export const validateRequiredFields = (fields, requiredFields) => {
  const invalidFields = {};

  requiredFields.forEach((field) => {
    if (!fields[field] || fields[field].trim() === "") {
      invalidFields[field] = `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } is required`;
    }
  });

  return invalidFields;
};

/**
 * Validates that a number is within range
 * @param {number} value - Number to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @return {boolean} True if value is within range
 */
export const validateNumberRange = (value, min, max) => {
  const numValue = Number(value);
  return !isNaN(numValue) && numValue >= min && numValue <= max;
};

/**
 * Validates date format (YYYY-MM-DD)
 * @param {string} dateString - Date string to validate
 * @return {boolean} True if date format is valid
 */
export const validateDateFormat = (dateString) => {
  if (!dateString) return false;

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(dateString)) return false;

  // Check if the date is valid
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Validates time format (HH:MM)
 * @param {string} timeString - Time string to validate
 * @return {boolean} True if time format is valid
 */
export const validateTimeFormat = (timeString) => {
  if (!timeString) return false;

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(timeString);
};

/**
 * Validates quest requirements
 * @param {Object} quest - Quest object to validate
 * @return {Object} Validation result with status and errors
 */
export const validateQuest = (quest) => {
  const errors = {};

  // Title is required and must be between 3 and 50 characters
  if (!quest.title || quest.title.trim() === "") {
    errors.title = "Title is required";
  } else if (quest.title.length < 3 || quest.title.length > 50) {
    errors.title = "Title must be between 3 and 50 characters";
  }

  // Description is required
  if (!quest.description || quest.description.trim() === "") {
    errors.description = "Description is required";
  }

  // Category is required
  if (!quest.category || quest.category.trim() === "") {
    errors.category = "Category is required";
  }

  // Difficulty is required
  if (!quest.difficulty || quest.difficulty.trim() === "") {
    errors.difficulty = "Difficulty is required";
  }

  // XP must be a positive number
  if (isNaN(quest.xp) || quest.xp <= 0) {
    errors.xp = "XP must be a positive number";
  }

  // Duration must be a positive number
  if (isNaN(quest.duration) || quest.duration <= 0) {
    errors.duration = "Duration must be a positive number";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates user profile data
 * @param {Object} profile - User profile object
 * @return {Object} Validation result with status and errors
 */
export const validateUserProfile = (profile) => {
  const errors = {};

  // Display name validation
  if (profile.displayName) {
    if (profile.displayName.length < 2 || profile.displayName.length > 30) {
      errors.displayName = "Display name must be between 2 and 30 characters";
    }
  }

  // Bio validation
  if (profile.bio && profile.bio.length > 160) {
    errors.bio = "Bio must be 160 characters or less";
  }

  // Age validation
  if (profile.age !== undefined) {
    const age = Number(profile.age);
    if (isNaN(age) || age < 13 || age > 120) {
      errors.age = "Age must be between 13 and 120";
    }
  }

  // Goals validation
  if (profile.goals && Array.isArray(profile.goals)) {
    if (profile.goals.length > 5) {
      errors.goals = "You can set a maximum of 5 goals";
    }

    profile.goals.forEach((goal, index) => {
      if (!goal || goal.trim() === "") {
        errors[`goals[${index}]`] = "Goal cannot be empty";
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates URL format
 * @param {string} url - URL to validate
 * @return {boolean} True if URL is valid
 */
export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Validates file size
 * @param {number} sizeInBytes - File size in bytes
 * @param {number} maxSizeInMB - Maximum allowed size in MB
 * @return {boolean} True if file size is valid
 */
export const validateFileSize = (sizeInBytes, maxSizeInMB) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return sizeInBytes <= maxSizeInBytes;
};

/**
 * Validates file type
 * @param {string} filename - Filename with extension
 * @param {Array} allowedExtensions - Array of allowed file extensions
 * @return {boolean} True if file type is valid
 */
export const validateFileType = (filename, allowedExtensions) => {
  const extension = filename.split(".").pop().toLowerCase();
  return allowedExtensions.includes(extension);
};

/**
 * Validates phone number format
 * @param {string} phoneNumber - Phone number to validate
 * @return {boolean} True if phone number format is valid
 */
export const validatePhoneNumber = (phoneNumber) => {
  // Basic phone validation (numbers, spaces, dashes, parentheses, plus sign)
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phoneNumber);
};

/**
 * Validates form data
 * @param {Object} formData - Form data object
 * @param {Object} validationRules - Validation rules object
 * @return {Object} Validation result with status and errors
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};

  Object.keys(validationRules).forEach((field) => {
    const value = formData[field];
    const rules = validationRules[field];

    // Required validation
    if (
      rules.required &&
      (!value || (typeof value === "string" && value.trim() === ""))
    ) {
      errors[field] = rules.errorMessage || `${field} is required`;
      return;
    }

    // Skip other validations if field is empty and not required
    if (!value && !rules.required) {
      return;
    }

    // Min length validation
    if (rules.minLength && value.length < rules.minLength) {
      errors[field] =
        rules.errorMessage ||
        `${field} must be at least ${rules.minLength} characters`;
      return;
    }

    // Max length validation
    if (rules.maxLength && value.length > rules.maxLength) {
      errors[field] =
        rules.errorMessage ||
        `${field} must be less than ${rules.maxLength} characters`;
      return;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      errors[field] = rules.errorMessage || `${field} format is invalid`;
      return;
    }

    // Custom validation
    if (rules.validate && typeof rules.validate === "function") {
      const validationResult = rules.validate(value, formData);
      if (validationResult !== true) {
        errors[field] = validationResult || `${field} is invalid`;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates a streak check-in
 * @param {Object} checkIn - Check-in data
 * @return {Object} Validation result
 */
export const validateStreakCheckIn = (checkIn) => {
  const errors = {};
  const now = new Date();

  // Check if date is valid
  if (!checkIn.date) {
    errors.date = "Check-in date is required";
  } else {
    const checkInDate = new Date(checkIn.date);

    // Check if date is in the future
    if (checkInDate > now) {
      errors.date = "Check-in date cannot be in the future";
    }

    // Check if date is too far in the past (more than 1 day)
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (now - checkInDate > oneDayMs) {
      errors.date = "Cannot check-in for dates more than 1 day in the past";
    }
  }

  // Validate activity completion
  if (
    !checkIn.completedActivities ||
    !Array.isArray(checkIn.completedActivities) ||
    checkIn.completedActivities.length === 0
  ) {
    errors.completedActivities = "At least one completed activity is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates schedule entry
 * @param {Object} entry - Schedule entry
 * @return {Object} Validation result
 */
export const validateScheduleEntry = (entry) => {
  const errors = {};

  // Title validation
  if (!entry.title || entry.title.trim() === "") {
    errors.title = "Title is required";
  }

  // Start time validation
  if (!entry.startTime) {
    errors.startTime = "Start time is required";
  } else if (!validateTimeFormat(entry.startTime)) {
    errors.startTime = "Invalid start time format (use HH:MM)";
  }

  // End time validation
  if (!entry.endTime) {
    errors.endTime = "End time is required";
  } else if (!validateTimeFormat(entry.endTime)) {
    errors.endTime = "Invalid end time format (use HH:MM)";
  }

  // Check if end time is after start time
  if (
    entry.startTime &&
    entry.endTime &&
    validateTimeFormat(entry.startTime) &&
    validateTimeFormat(entry.endTime)
  ) {
    const [startHour, startMinute] = entry.startTime.split(":").map(Number);
    const [endHour, endMinute] = entry.endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (endMinutes <= startMinutes) {
      errors.endTime = "End time must be after start time";
    }
  }

  // Day validation
  if (!entry.day || entry.day.trim() === "") {
    errors.day = "Day is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates attribute points allocation
 * @param {Object} attributes - Attribute points
 * @param {number} totalPoints - Total points available
 * @return {Object} Validation result
 */
export const validateAttributeAllocation = (attributes, totalPoints) => {
  const errors = {};

  // Check if all attributes are numbers
  for (const attr in attributes) {
    if (isNaN(attributes[attr])) {
      errors[attr] = `${attr} must be a number`;
    } else if (attributes[attr] < 0) {
      errors[attr] = `${attr} cannot be negative`;
    }
  }

  // Check if total attributes exceed available points
  const usedPoints = Object.values(attributes).reduce(
    (sum, val) => sum + Number(val),
    0
  );

  if (usedPoints > totalPoints) {
    errors.general = `You've used ${usedPoints} points but only have ${totalPoints} available`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    remainingPoints: totalPoints - usedPoints,
  };
};

/**
 * Generates validation rules for forms
 * @param {Object} schema - Schema defining validation rules
 * @return {Object} Validation rules object for use with validateForm
 */
export const createValidationRules = (schema) => {
  const rules = {};

  for (const field in schema) {
    rules[field] = {};

    if (schema[field].required) {
      rules[field].required = true;
    }

    if (schema[field].minLength) {
      rules[field].minLength = schema[field].minLength;
    }

    if (schema[field].maxLength) {
      rules[field].maxLength = schema[field].maxLength;
    }

    if (schema[field].pattern) {
      rules[field].pattern = schema[field].pattern;
    }

    if (schema[field].validate) {
      rules[field].validate = schema[field].validate;
    }

    if (schema[field].errorMessage) {
      rules[field].errorMessage = schema[field].errorMessage;
    }
  }

  return rules;
};
