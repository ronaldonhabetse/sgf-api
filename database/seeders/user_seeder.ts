import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '../../app/models/security/user.js'

export default class extends BaseSeeder {
  async run() {
    User.accessTokens.create(await User.create(
      {
        fullName: 'Root',
       // username: 'Root',
        email: 'root@gmail.com',
        password: 'sebadora123',
      }
    ))
    User.accessTokens.create(await User.create(
      {
        fullName: 'admin',
      //  username: 'Root',
        email: 'admin@gmail.com',
        password: 'sebadora123',
      }
    ))
  }
}