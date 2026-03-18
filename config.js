module.exports = {
    SESSION_ID: process.env.SESSION_ID || "POPKID~;;;H4sIAAAAAAAAA5VU246jRhD9lahfba0BG2MsjRSuNsY3jPFlon1ooMFtru5ubMNqfiLPkfKL+YQIz8zOPiSbyVtTlE6dqnOqvoG8wBTZqAbjb6Ak+AoZap+sLhEYA7WKIkRAF4SQQTAG7sr21/Yqiprn2j/ZHbevJaUzPIrZZpvilelNUHHLe+uR4DyBly4oKz/FwU8AY0PcNcjvBz1JtUWTdHa3dTiLsJwNI8k4rgsZJdJpp3gCfQIvLSLEBOexUZ5QhghMbVSvISafo18trZNqik6uREHHfrbyJlhzThAeZwOxofNZwyKHxKov8PHn6PM9a2MGxX03aE6x0sHZ4KD7094+7JuJ2Yt6PbOo1I52kbDxSp/iOEehFaKcYVZ/eu5wTrLRyqz3lBfK+prtpA1H9fCueMYNdxxuWMreAHvE33GfI75KR0s0s/eKIxpZeMn3ohFafaQIaWUOKbMafV0HDFph6vxIfE3evZL8n7m7s6U7c1x5W4faFivDRFjMtV6BtpMVydYqKgbHBb6Z5cWkn6OfH/abRKKldL1u7Oe55S6maUfYap3nxagTm7drOrk35XXOT5QP+pBV5GcsubuoeCN6EGxXzdTBZOU4nBcbjTNlLoS2GBt1xM3uS2TxZzUNryX1O+isLEPP08/2IucVuUqgrqfi8F43u/NEFPvn+OnRUYJqKwRj/qULCIoxZQQyXOSPmDDqAhheXRQQxB7jBUjJ8umtKJT+oTF539+Qo+Ol5vN+Vruitwjky64297HBi8ET6IKSFAGiFIVTTFlB6gWiFMaIgvFvX7sgR3f2Klxbbih0QYQJZV5elWkBw3dV33/CICiqnLl1HmjtAxEw5j7CiDGcx7SdY5VDEpzwFWknyCgYRzCl6HuHiKAQjBmp0Pet1YqwHbw9H/G2MDVBF2QPQXAIxkAQBzzP90eiNJDGg8Gv9MuthYVl+SVHDHRB+kjry+JIkAVeFgYjXmgT23gX5LDFAmVRJjj8JUF//fn7H+3k33i3ZULEIE4pGANt7TfVRZkYC+0qLbjJRHFiRYsV8NHnu2FeBdnC2IV7r3RPIs/Ns4147ntTw6TBYm7tHHRYLbiwUSMJ3b2nfwABYxCuTwduqW2cvqvPNpZEEpzpS2kox8lz5S09u5QzPpGP+qo4TkZM2x/Dyt40tXVIDupydZaO2eXQE6KqGg3rkvWCvTbVnae2WoiuOEA/FjM2h0Su0G15dW1+Uffhivgw2MS6ohgH/7I6xKvOVg+zGXeaObvTuTPDx61upPeVv9mfPZLerKkjS56si3n/epNoRRfYebXyY5XStxOGHyZrFWw/I4weF+FNi/9U9JV4azzupfsDxtuN+Zc9VT2hMLI0tb0ChaEmJugo8+pd9ae6VpveNG3Oy2lwO3T6dAdeXr52QZlCFhUkay9pHpLiYRhSVK2TrTwqflJMUzjLiGOr7TyFlCkf27HFGaIMZiUY85LUHw1ljhu8Zq1JUU4hPYExWO8TUW2dXitl6TLI3ncNKFqiKDNXAy9/A6yx5hOHBwAA", 
    PREFIX: process.env.PREFIX || ".",
    OWNER_NUMBER: process.env.OWNER_NUMBER ? process.env.OWNER_NUMBER.split(',') : ["254732297194"],
    OWNER_NAME: process.env.OWNER_NAME || "Popkid Kenya",
    AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "true",
    AUTO_REACT_STATUS: process.env.AUTO_REACT_STATUS || "true",
    ANTICALL: process.env.ANTICALL || "false",
    AUTO_BIO: process.env.AUTO_BIO || "true",
    BOT_OFF: process.env.BOT_OFF || "false",
    NON_PREFIX: process.env.NON_PREFIX || "true",
    MODE: process.env.MODE || "public",
    ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || "true",
    AUTO_TYPING: process.env.AUTO_TYPING || "true",
    AUTO_RECORDING: process.env.AUTO_RECORDING || "false",
    AUTO_REACT: process.env.AUTO_REACT || "false",
    ANTIDELETE: process.env.ANTIDELETE || "indm" // Settings: inchat / indm / false
}
