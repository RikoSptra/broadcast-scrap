const { v4: uuidv4 } = require("uuid");
const { getDB } = require("../config/database");

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "Nama harus diisi" });
    const db = getDB();

    await db.collection("Categories").insertOne({
      _id: uuidv4(),
      name,
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
    });
    console.log("category berhasil dibuat");

    res.status(200).json({
      success: true,
      message: "category berhasil dibuat",
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "Nama harus diisi" });
    const db = getDB();

    await db.collection("Categories").updateOne(
      {
        _id: req.params._id,
      },
      {
        $set: {
          name,
          _updatedAt: new Date().toISOString(),
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "category berhasil diupdate",
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { _id } = req.params;
    const db = getDB();

    await db.collection("Categories").updateOne(
      {
        _id,
      },
      {
        $set: {
          _deletedAt: new Date().toISOString(),
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "category berhasil diupdate",
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server" });
  }
};

exports.getAllCategory = async (req, res) => {
  try {
    const db = getDB();

    const categories = await db
      .collection("Categories")
      .find({
        _deletedAt: {
          $exists: false,
        },
      })
      .toArray();

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server" });
  }
};
