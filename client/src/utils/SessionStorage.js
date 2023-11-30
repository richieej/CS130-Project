function storeItem(key, val) {
  sessionStorage.setItem(key, JSON.stringify(val));
}

function retrieveItem(key) {
  const data = JSON.parse(sessionStorage.getItem(key));
  return data;
}

export default { storeItem, retrieveItem };
