export const inifinteScrollToBottom = (currentPage) => {
  return new Promise((resolve, reject) => {
    try {
      currentPage.evaluate(() => {
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
              
              if(document.body.scrollHeight === scrollHeight) {
                clearInterval(interval);
                resolve();
              }
            }, 50)
           
          }
        }, 100);
      });
    } catch (err) {
      console.error("Couldn't scroll through page, something went wrong", err);
      reject(err);
    }
  });
};