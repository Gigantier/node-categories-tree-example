const request = require('request-promise');
const querystring = require('querystring');
const groupBy = require('lodash/groupBy');

const CATEGORY_PRINT_PREFIX = '    --> ';
const apiHost = process.env.API_HOST;
const apiPrefix = '/api/v1';
const tokenUri = `${apiPrefix}/OAuth/token`;
const categoriesUri = `${apiPrefix}/Menu/list`;
const tokenRequestBody = querystring.stringify({
  'client_id': process.env.API_CLIENT_ID,
  'client_secret': process.env.API_CLIENT_SECRET,
  'scope': process.env.API_SCOPE,
  'grant_type': 'client_credentials'
});

function post(url, body) {
  return request({
    method: 'POST',
    uri: url,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body
  }).then(JSON.parse);
}

function getApiToken() {
  return post(apiHost + tokenUri, tokenRequestBody).then(result => result.access_token);
}

function getCategories(apiToken) {
  return post(apiHost + categoriesUri, querystring.stringify({
    'access_token': apiToken,
    'all': true
  })).then(result => result.menues);
}

function buildUIData(categories) {
  let map = categories.reduce((cs, c) => { cs[c.id] = c; return cs }, {});
  let groups = groupBy(categories, category => category.parentId);

  return groups[null].map(c => Object.assign({}, { 
    category: map[c.id], 
    children: typeof groups[c.id]!== 'undefined' ? groups[c.id] : [] 
  }));

  /*
  let map = {};

  categories
    .filter(c => c.parentId == null)
    .forEach(c => map[c.id] = { category: c, children: [] });

  categories
    .filter(c => c.parentId != null && typeof map[c.parentId] !== 'undefined')
    .forEach(c => map[c.parentId].children.push(c));

  return Object.values(map);*/
}

function getUIData() {
  return getApiToken().then(getCategories).then(buildUIData);
}

function printUIData(uiData) {
  console.log(uiData.category.name);
  uiData.children.forEach(c => console.log(CATEGORY_PRINT_PREFIX + c.name));
}

// --

getUIData()
  .then(data => data.forEach(printUIData))
  .catch(err => console.error('Cannot get ui data.', err));
