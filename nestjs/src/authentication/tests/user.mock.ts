import User from "src/users/models/user.entity";


const mockedUser: User = {
  id: 1,
  email: 'user@email.com',
  fullName: 'John',
  businessName: 'businessName',
  username: 'username',
  password: 'hash',
  stripeCustomerId: 'stripe_customer_id',
  phoneNumber: '+48123123123',
  address: {
    id: 1,
    street: 'streetName',
    city: 'cityName',
    country: 'countryName'
  },
  isEmailConfirmed: false,
  isAdmin: false,
}

export default mockedUser;