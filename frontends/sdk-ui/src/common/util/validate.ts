export const isNullOrEmpty = (value) => {
  if (!value) return true;
  if (value === undefined || value === null || value === '') return true;
  return false;
}

export const isNullOrUndefined = (value) => {
  if (value == 0) return false
  if (!value) return true;
  if (value === undefined || value === null || value === '') return true;
  return false;
}

export const ValidateEmail = email => {
  const newEmail = email.trim();
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(newEmail);
};

export const isArrayOrEmty = (value) => {
  if (Array.isArray(value) && value.length == 0) {
    return true
  }
  if (value == null || value == undefined) {
    return true
  }
  return false;
};

export const ValidatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return false;
  
  const cleaned = String(phoneNumber).replace(/[^\d+]/g, '');
  const phoneRegex = /^(0|84|\+84)(3|5|7|8|9)[0-9]{8}$/;

  return phoneRegex.test(cleaned);
};
