export const extractMediumAuthorNameFromURL = (url) => {
  if (!/^(ftp|http|https):\/\/[^ "]+$/.test(url)) {
    throw "Invalid URL";
  }

  let name = /^\/@(\S*)\/$/.match(url);

  if (!name) {
    name = url.split(".")[0];
  }

  if (!name) {
    return (name = url);
  }

  return name;
};
