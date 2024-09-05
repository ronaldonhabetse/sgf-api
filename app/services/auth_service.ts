import User from "../models/user.js";

export default class AuthService {

    public static async authenticate(email: string, password: string) {

        /**
        * Verify the password using the hash service
        */
        const user = await User.verifyCredentials(email, password);
        /**
         * Now login the user or create a token for them
         */
        const token = await User.accessTokens.create(user)

        console.log(token);

        return token;

        /**
         * return {
               type: 'bearer',
               value: token.value!.release(),
           }
         * 
         *  */
    }

    public static async isAuthenticated(email: string, password: string) {
    }

    public static async resetPassword(email: string, password: string) {
    }
}