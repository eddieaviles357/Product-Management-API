
const removeNonAlphaNumericChars = (word) => {
  if(typeof word !== 'string') throw new Error('Must be a string');
  
  return word.replace(/[^a-zA-Z0-9]/g, '');
}

module.exports = removeNonAlphaNumericChars