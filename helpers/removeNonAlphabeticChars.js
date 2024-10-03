// Removes all Non Alphabetic Chars eg ( ' 123 hello @#$ ' --> 'hello' )
const removeNonAlphabeticChars = (word) => {
  if(typeof word !== 'string') throw new Error('Must be a string');
  
  return word.replace(/[^a-zA-Z]/g, '');
}

module.exports = removeNonAlphabeticChars