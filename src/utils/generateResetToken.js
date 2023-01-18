import { v4 as uuidv4 } from "uuid";

const generateResetToken = () => {
  return uuidv4();
};

export default generateResetToken;
