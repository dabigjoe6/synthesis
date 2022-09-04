const generateEmailTemplate = (posts) => {
  if (posts && posts.length > 0) {
    let postsHTML = "";
    posts.forEach((post) => {
      postsHTML += `<div><img src=${post.image} /><br /><h4>${post.title}</h4><br /><p>${post.description}</p><br /><a href=${post.url} target="_blank">Read more</a></div><br />`;
    });
    return (
      `<div><h1>Here's your monring brew</h1><br /><div><br />` + postsHTML
    );
  } else {
    return "";
  }
};

export default generateEmailTemplate;
