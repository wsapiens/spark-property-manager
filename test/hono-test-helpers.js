async function fetchText(app, url, options) {
  const response = await app.fetch(new Request(url, options));
  return {
    response,
    body: await response.text()
  };
}

async function fetchJson(app, url, options) {
  const response = await app.fetch(new Request(url, options));
  const text = await response.text();
  return {
    response,
    body: JSON.parse(text)
  };
}

function cookieHeader(response) {
  return response.headers.get('set-cookie');
}

module.exports = {
  cookieHeader,
  fetchJson,
  fetchText
};
