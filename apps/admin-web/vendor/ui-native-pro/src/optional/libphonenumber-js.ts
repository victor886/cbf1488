let LibPhoneNumberPackage;
try {
  LibPhoneNumberPackage = require('libphonenumber-js');
} catch (_error) {
  /* libphonenumber-js is an optional peer dependency */
}
export default LibPhoneNumberPackage;
