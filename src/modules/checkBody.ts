type BodyType = {
  [key: string]: string
}

function checkBody(body: BodyType, keys: string[]) {
  let isValid = true;

  for (const field of keys) {
    if (!body[field] || body[field] === '') {
      isValid = false;
    }
  }

  return isValid;
}

export { checkBody };