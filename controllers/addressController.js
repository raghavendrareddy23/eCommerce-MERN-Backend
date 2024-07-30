const Address = require("../models/address");

const addAddress = async (req, res) => {
  const {
    type,
    fullName,
    addressLine1,
    city,
    state,
    zip,
    country,
    phone,
  } = req.body;

  if (!type || !fullName || !addressLine1 || !city || !state || !zip || !country || !phone) {
    return res.status(400).json({ message: "All address fields are required" });
  }

  const zipRegex = /^\d{6}$/;
  if (!zipRegex.test(zip)) {
    return res.status(400).json({ message: "Invalid zip code format" });
  }

  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ message: "Invalid phone number format" });
  }

  let userId = req.params.id;

  if (!userId && req.user) {
    userId = req.user._id;
  }

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const newAddress = new Address({
      userId,
      type,
      fullName,
      addressLine1,
      city,
      state,
      zip,
      country,
      phone,
    });

    const savedAddress = await newAddress.save();

    res.status(201).json(savedAddress);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getAddresses = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = req.user._id;

    const addresses = await Address.find({ userId });

    if (!addresses || addresses.length === 0) {
      return res.status(404).json({ message: "No addresses found for the user" });
    }

    res.status(200).json(addresses);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateAddress = async (req, res) => {
  const addressId = req.params.id;
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const userId = req.user._id;

  try {
    const address = await Address.findOne({ _id: addressId, userId });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (req.body.type) address.type = req.body.type;
    if (req.body.fullName) address.fullName = req.body.fullName;
    if (req.body.addressLine1) address.addressLine1 = req.body.addressLine1;
    if (req.body.addressLine2) address.addressLine2 = req.body.addressLine2;
    if (req.body.city) address.city = req.body.city;
    if (req.body.state) address.state = req.body.state;
    if (req.body.zip) address.zip = req.body.zip;
    if (req.body.country) address.country = req.body.country;
    if (req.body.phone) address.phone = req.body.phone;

    const updatedAddress = await address.save();

    res.status(200).json(updatedAddress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const userId = req.user._id;

    const deletedAddress = await Address.findOneAndDelete({ _id: addressId, userId });

    if (!deletedAddress) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
};
