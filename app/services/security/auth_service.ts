import { Secret } from "@adonisjs/core/helpers";
import User from "../../models/security/user.js";

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

        return {
            type: 'bearer',
            value: token.value!.release(),
        }
    }

    /**
       * Verify the password using the hash service
       */
    public static async isAuthenticated(tokenValue: string) {


        return User.accessTokens.verify(new Secret(tokenValue));
    }

   // public static async resetPassword(email: string, password: string) {
    //}
}