import User from "#models/security/user";
import { Secret } from "@adonisjs/core/helpers";
import jwt from 'jsonwebtoken';  // Importando jsonwebtoken corretamente

export default class AuthService {

    public static async authenticate(email: string, password: string) {
        /**
        * Verify the password using the hash service
        */
        const user = await User.verifyCredentials(email, password);
        /**
         * Now login the user or create a token for them
         */
        console.log("Crdenciais", user)
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


    public static async verifyToken(token: string | undefined) {
        if (!token) {
          throw new Error('Token não fornecido');
        }
    
        try {
           // Decodifica o token sem validar a assinatura
        const decoded = jwt.decode(token);

        if (!decoded) {
            throw new Error('Token inválido ou malformado');
        }
          // Retorna os dados decodificados do token
          return decoded;
        } catch (error) {
          throw new Error('Token inválido ou expirado');
        }
      }
   // public static async resetPassword(email: string, password: string) {
    //}
}