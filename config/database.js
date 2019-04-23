const { MONGODB_NAME } = process.env;
module.exports = {
    "mongodb_url": `mongodb://localhost/${MONGODB_NAME}`,
}
