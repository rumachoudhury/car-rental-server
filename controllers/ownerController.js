import upload from "../middleware/multer.js";
import User from "../models/User.js";
import fs from "fs";
import imagekit from "../configs/imageKit.js";
import Car from "../models/Car.js";

//API to change Role of User
export const changeRoleToOwner = async (req, res) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { role: "owner" });
    res.json({ success: true, message: "Now you can list cars" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//API to list car
export const addCar = async (req, res) => {
  try {
    const { _id } = req.user;
    let car = JSON.parse(req.body.carData);
    const imageFile = req.file;

    //upload Image to ImageKit
    const fileBuffer = fs.readFileSync(imageFile.path);
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/cars",
    });

    // optimization through imageKit URL transformation
    var optimizedimageURL = imagekit.url({
      path: response.filePath,
      transformation: [
        { width: "1280" }, //width resizing
        { quality: "auto" }, //Auto compression
        { format: "webp" }, //convert to modern format
      ],
    });

    const image = optimizedimageURL;

    await Car.create({ ...car, owner: _id, image });
    res.json({ success: true, message: "Car Added" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//API to List Owner Car
export const getOwnerCars = async (req, res) => {
  try {
    const { _id } = req.user;
    const cars = await Car.find({ owner: _id });
    res.json({ success: true, cars });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//API to Toggle Car Availability
export const toggleCarAvailability = async (req, rea) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;
    const car = await Car.findById(carId);

    // checking is car belongs to the user
    if (car.owner.toString() !== _id.toString()) {
      res.json({ success: false, message: "Unauthorized" });
    }

    car.isAvailable = !car.isAvailable;
    await car.save();

    res.json({ success: true, message: "Availability Toggled" });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//API TO Delete car
export const deleteCar = async (req, rea) => {
  try {
    const { _id } = req.user;
    const { carId } = req.body;
    const car = await Car.findById(carId);

    // checking is car belongs to the user
    if (car.owner.toString() !== _id.toString()) {
      res.json({ success: false, message: "Unauthorized" });
    }

    car.owner = null;
    car.isAvailable = false;
    await car.save();

    res.json({ success: true, message: "Car Removed" });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//API to get Dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const { _id, role } = req.user;

    if (role !== "owner") {
      res.json({ success: false, message: "Unauthorized" });
    }

    const cars = await Car.find({ owner: _id });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
