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