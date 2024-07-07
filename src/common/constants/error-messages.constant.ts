export const errorMessages = {
  EMAIL_ALREADY_EXISTS: 'User with this email already exists',
  WRONG_EMAIL_OR_PASSWORD: 'Wrong email or password',
  WRONG_TOKEN_TYPE: 'Wrong token type',
  INVALID_TOKEN: 'Token is not valid',
  NO_TOKEN_PROVIDED: 'No token provided',
  INVALID_ID: 'Invalid ID',
  USER_NOT_FOUND: 'User was not found',
  CAR_NOT_FOUND: 'Car was not found',
  ONE_POST_FOR_BASIC_ACCOUNT:
    'Basic account holders can only create one car for sale.',
  NOT_AUTHENTICATED_EMAIL: 'Email is not belong to authenticated user',
  ACCESS_DENIED_USER_ROLE:
    'User role does not have sufficient permissions to perform this action.',
  BRAND_MODEL_ALREADY_EXIST: 'Brand and model already exist.',
  POST_NOT_FOUND: 'Post was not found',
  ACCESS_POST_DENIED: 'You do not have permission to access this post',
  REPORT_NOT_FOUND: 'Report was not found',
  ACHIEVED_MAX_NUMBER_OF_PROFANITY_EDITS:
    'Achieved maximum number of profanity edits',
  INVALID_ORDER_BY: 'Invalid orderBy',
  INVALID_TOKEN_TYPE: 'Invalid token type',
  WRONG_OLD_PASSWORD: 'Wrong  old password',
  INVALID_CURRENCY_TYPE: 'Invalid currency type',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  PRICE_AND_CURRENCY_REQUIRED: 'Both price and currency are required',
  CANNOT_FETCH_EXCHANGE_RATES: 'Could not fetch exchange rates',
  ACCESS_DENIED_FOR_BASIC_ACCOUNT:
    'Only users with Premium account type can access the information about post.',
  ACCESS_DENIED_FOR_PROFANE_POST: 'Access denied for profane post.',
  CANNOT_DELETE_POST_ACHIEVED_MAX_NUMBER_OF_PROFANITY_EDITS:
    'Cannot delete post achieved max number of profanity edits.',
  POST_IS_ALREADY_NOT_ACTIVE: 'Post is already not active.',
  MAXIMUM_NUMBER_OF_IMAGES_EXCEEDED: (maxUploadImages: number) =>
    `Maximum number of images exceeded. You can upload up to ${maxUploadImages} images.`,
  ONLY_ACTIVE_POSTS_CAN_HAVE_IMAGES_DOWNLOADED:
    'Only active posts can have images downloaded.',
  IMAGE_NOT_FOUND: 'Image not found',
  DEALERSHIP_ALREADY_EXISTS: 'Dealership with this name already exists',
  DEALERSHIP_EMAIL_ALREADY_EXISTS: 'Dealership with this email already exists',
  DEALERSHIP_NOT_FOUND: 'Dealership was not found',
};
