import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '../../app/models/user.js'

export default class extends BaseSeeder {
  async run() {
    User.accessTokens.create(await User.create(
      {
        id: 1,
        fullName: 'Root',
        email: 'root@gmail.com',
        password: 'sabadora123',
      }
    ))
    User.accessTokens.create(await User.create(
      {
        id: 2,
        fullName: 'admin',
        email: 'adimn@gmail.com',
        password: 'sabadora123',
      }
    ))
  }
}