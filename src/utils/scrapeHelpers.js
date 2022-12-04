export const parseMediumUrl = (url) => {
  // If URL matches https://josepholabisi.medium.com convert to https://medium.com/@josepholabisi
  // If URL matches https://medium.com/@josepholabisi leave as is
  
  let split = url.split("/@");
  if (split.length >= 2) return url;

  split = url.split(".");
  const name = split[0].split("//")[1];

  return `https://medium.com/@${name}`;
};

export const extractMediumAuthorNameFromURL = (url) => {
  if (!/^(ftp|http|https):\/\/[^ "]+$/.test(url)) {
    throw "Invalid URL";
  }

  const mediumUsernameRegex = /^\/@(\S*)\/$/;

  let name = url.match(mediumUsernameRegex);

  let split = url.split("/@");

  if (split.length >= 2) {
    name = split[1];
  }

  if (name) {
    console.log("Author name: ", name);
    return name;
  }

  split = url.split(".");
  name = split[0].split("//")[1];

  if (name) {
    console.log("Author name: ", name);
    return name;
  }

  if (!name) {
    return (name = url);
  }

  console.log("Author name: ", name);
  return name;
};

export const inifinteScrollToBottom = (currentPage) => {
  console.log("Scrolling to bottom");
  return new Promise(async (resolve, reject) => {
    try {
      await currentPage.evaluate(async () => {
        const initScrollToBottom = () => {
          return new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 200;
            const interval = setInterval(() => {
              const scrollHeight = document.body.scrollHeight;
              window.scrollBy(0, distance);
              totalHeight += distance;

              if (totalHeight >= scrollHeight - window.innerHeight) {
                //confirm No change in scrollHeight
                window.scrollBy(0, window.innerHeight);

                setTimeout(() => {
                  if (document.body.scrollHeight === scrollHeight) {
                    resolve();
                    clearInterval(interval);
                  }
                }, 50);
              }
            }, 100);
          });
        };

        await initScrollToBottom();
      });

      console.log("Scrolled to bottom");
      resolve();
    } catch (err) {
      console.error("Couldn't scroll through page, something went wrong", err);
      reject(err);
    }
  });
};
