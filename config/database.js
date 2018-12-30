const { MONGODB_NAME } = process.env;
module.exports = {
    "mongodb_url": `mongodb://mongo:27017/${MONGODB_NAME}`,
}
