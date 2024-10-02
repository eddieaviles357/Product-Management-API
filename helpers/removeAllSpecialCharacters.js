
const removeAllSpecialChars = (word) => {
  if(typeof word !== 'string') throw new Error('Must be a string');
  
  return word.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}\[\]\\\//\d/ /]/gi, '');
}

module.exports = removeAllSpecialChars