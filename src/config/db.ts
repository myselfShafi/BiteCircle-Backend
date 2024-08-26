import mongoose from "mongoose";

const connectToDB = async () => {
  try {
    const instance = await mongoose.connect(
      `${process.env.MONGO_URI}/${process.env.DB_NAME}`
    );
    console.log(`\n MongoDB connected !! DB HOST: ${instance.connection.host}`);
  } catch (error) {
    console.log("MONGODB connection FAILED ", error);
    process.exit(1);
  }
};

export default connectToDB;
