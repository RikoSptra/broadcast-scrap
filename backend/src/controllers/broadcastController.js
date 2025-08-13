const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../config/database');
const { uploadBase64ToWasabiWithMimeType } = require('../helper/uploadToWasabi');

async function processMessages(messages) {
  const processedMessages = [];
  for (const message of messages) {
    let processedMessage = { ...message };
    if (message.file && message.file.startsWith('data:')) {
      const base64Data = message.file;
      const mimeType = base64Data.split(';')[0].split(':')[1];
      const fileExtension = mimeType.split('/')[1];
      const fileName = `${uuidv4()}.${fileExtension}`;

      const result = await uploadBase64ToWasabiWithMimeType(
        base64Data,
        `broadcasts/MessageMedia`,
        fileName
      );
      processedMessage.base64 = base64Data;
      processedMessage.file = result.mediaUrl;
    } else {
      processedMessage.file = message.existingFile;
    }
    processedMessages.push(processedMessage);
  }
  return processedMessages;
}

exports.createBroadcast = async (req, res) => {
  try {
    const { name, description, messages } = req.body;
    if (!name || !messages) return res.status(400).json({ success: false, message: 'Nama, pesan harus diisi' });
    const db = getDB();

    const processedMessages = await processMessages(messages);

    await db.collection('broadcasts').insertOne({
      id: uuidv4(),
      name,
      description,
      messages: processedMessages,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Broadcast berhasil dibuat'
    });
  } catch (error) {
    console.error('Error creating broadcast:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}

exports.getBroadcasts = async (req, res) => {
  try {
    const db = getDB();
    const broadcasts = await db.collection('broadcasts').find({ _deleted: { $exists: false } }).toArray();

    res.status(200).json({
      success: true,
      data: broadcasts
    });
  } catch (error) {
    console.error('Error getting broadcasts:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}

exports.getBroadcastById = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const broadcast = await db.collection('broadcasts').findOne({ id, _deleted: { $exists: false } });

    if (!broadcast) {
      return res.status(404).json({ success: false, message: 'Broadcast tidak ditemukan' });
    }

    res.status(200).json({
      success: true,
      data: broadcast
    });
  } catch (error) {
    console.error('Error getting broadcast:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}

exports.updateBroadcast = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, messages } = req.body;

    if (!name || !messages) {
      return res.status(400).json({ success: false, message: 'Nama dan pesan harus diisi' });
    }

    const db = getDB();
    const broadcast = await db.collection('broadcasts').findOne({ id, _deleted: { $exists: false } });

    if (!broadcast) {
      return res.status(404).json({ success: false, message: 'Broadcast tidak ditemukan' });
    }

    const processedMessages = await processMessages(messages);

    await db.collection('broadcasts').updateOne(
      { id },
      {
        $set: {
          name,
          description,
          messages: processedMessages,
          updatedAt: new Date()
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Broadcast berhasil diperbarui'
    });
  } catch (error) {
    console.error('Error updating broadcast:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}

// Delete broadcast
exports.deleteBroadcast = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const broadcast = await db.collection('broadcasts').findOne({ id, _deleted: { $exists: false } });

    if (!broadcast) {
      return res.status(404).json({ success: false, message: 'Broadcast tidak ditemukan' });
    }

    await db.collection('broadcasts').updateOne({ id }, { $set: { _deleted: true } });

    res.status(200).json({
      success: true,
      message: 'Broadcast berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting broadcast:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
}
