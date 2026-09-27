function checkBody<Type, Keys extends keyof Type>(body: Type, keys: Keys[]): boolean {
  let isValid = true;

  for (const field of keys) {
    if (!body[field] || body[field] === '') {
      isValid = false;
    }
  }

  return isValid;
}

export { checkBody };