const bcrypt = require("bcryptjs")

const users = []

export const authController = {
    findUser: (email) => users.find(user => user.email === email),

    createUser: (email, password) => {
        const hashedPassword = bcrypt.hashSync(password, 8)
        const newUser = { email, password: hashedPassword }
        users.push(newUser)
        return newUser
    }
}
