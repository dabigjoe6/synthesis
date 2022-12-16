export const launchConfig = {
  //TODO: Confirm if this works
  headless: process.env.NODE_ENV === "development" ? false : true,
  args: ["--no-sandbox"],
};

export const viewport = {
  width: 1000,
  height: 9999,
};
