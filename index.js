import "isomorphic-fetch";

const apiHost = process.env.API_HOST;
const apiPrefix = '/api/v1';
const tokenUri = `${apiPrefix}/OAuth/token`;
const categoriesUri = `${apiPrefix}/Menu/list`;

const tokenRequestBody = {
  'client_id': process.env.API_CLIENT_ID,
  'client_secret': process.env.API_CLIENT_SECRET,
  'scope': process.env.API_SCOPE,
  'grant_type': 'client_credentials'
};

function post(url, body) {
  return fetch(url, { method: 'POST', body: JSON.stringify(body) }).then(r => r.json());
}

function getApiToken() {
  return post(`${apiHost}${tokenUri}`, tokenRequestBody).then(result => result.access_token);
}

function getCategories(apiToken) {
  return post(`${apiHost}${categoriesUri}`, { 'access_token': apiToken, 'all': true }).then(result => result.menues);
}

function printUIData(groups, [n, ...others], prefix) {
  if (typeof n !== 'undefined') {
    console.log(`${prefix}> ${n.name}`);
    printUIData(groups, (groups[n.id] || []), `${prefix}  `);
    printUIData(groups, others, prefix);	
  }
}

// --

getApiToken().then(getCategories).then(data => {
  const groups = data.reduce((ns, n) => { (ns[n.parentId] = ns[n.parentId] || []).push(n); return ns; }, {});
  printUIData(groups, groups[null], '');
}).catch(err => console.error('Cannot get ui data.', err));
