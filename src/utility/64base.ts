export const uploadImage = async (file: Express.Multer.File) => {
  try {
    // Ensure that the file object exists and has a buffer
    if (!file || !file.buffer) {
      throw new Error('Invalid file object or buffer missing');
    }

    // Convert the file buffer to a base64 encoded string
    const base64Image = file.buffer.toString('base64');

    // Create a data URI from the base64 encoded string
    const dataURI = `data:${file.mimetype};base64,${base64Image}`;

    // Return the data URI
    return dataURI;
  } catch (error: any) {
    // Handle any errors that occur during the conversion process
    console.error('Error converting image to data URI:', error.message);
    throw error; // Optionally re-throw the error to be handled elsewhere
  }
};
