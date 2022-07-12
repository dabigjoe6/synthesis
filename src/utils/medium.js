export const extractMediumAuthorNameFromURL = (url) => {
  if (!/^(ftp|http|https):\/\/[^ "]+$/.test(url)) {
    throw "Invalid URL";
  }

  const mediumUsernameRegex =  /^\/@(\S*)\/$/;

  let name = url.match(mediumUsernameRegex);

  let split = url.split("/@");

  if (split.length >= 2) {
    name = split[1];
  }

  split = url.split(".");
  name = split[0].split('//')[1];

  if (!name) {
    return (name = url);
  }
  console.log("Author name: ", name);

  return name;
};
