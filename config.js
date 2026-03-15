module.exports = {
    SESSION_ID: process.env.SESSION_ID || "POPKID~Your_Session_Here", 
    PREFIX: process.env.PREFIX || ".",
    OWNER_NUMBER: process.env.OWNER_NUMBER ? process.env.OWNER_NUMBER.split(',') : ["254732297194"],
    OWNER_NAME: process.env.OWNER_NAME || "Popkid Kenya",
    AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "true",
    AUTO_REACT_STATUS: process.env.AUTO_REACT_STATUS || "true",
    AUTO_BIO: process.env.AUTO_BIO || "true",
    MODE: process.env.MODE || "public" // Good to have for future plugins
}
