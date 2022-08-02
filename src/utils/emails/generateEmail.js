const generateEmail = (posts) => {
  `<div><h1>Here's your monring brew</h1><br /><div>${posts.forEach((post) => {
    return `<div><img src=${post.image} /><br /><h4>${post.title}</h4><br /><p>${post.description}</p><br /><a href=${post.url} target="_blank">Read more</a></div>`;
  })}</div></div>`;
};
