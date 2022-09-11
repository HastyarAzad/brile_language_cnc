const letters_dict = {
  'special' : [[0,0],[0,1],[0,1]],
  'a' : [[1,0],[0,0],[0,0]],
  'b' : [[1,0],[1,0],[0,0]],
  'c' : [[1,1],[0,0],[0,0]],
  'd' : [[1,1],[0,1],[0,0]],
  'e' : [[1,0],[0,1],[0,0]],
  'f' : [[1,1],[1,0],[0,0]],
  'g' : [[1,1],[1,1],[0,0]],
  'h' : [[1,0],[1,1],[0,0]],
  'i' : [[0,1],[1,0],[0,0]],
  'j' : [[0,1],[1,1],[0,0]],
  'k' : [[1,0],[0,0],[1,0]],
  'l' : [[1,0],[1,0],[1,0]],
  'm' : [[1,1],[0,0],[1,0]],
  'n' : [[1,1],[0,1],[1,0]],
  'o' : [[1,0],[0,1],[1,0]],
  'p' : [[1,1],[1,0],[1,0]],
  'q' : [[1,1],[1,1],[1,0]], // change this
  'r' : [[1,0],[1,1],[1,0]],
  's' : [[0,1],[1,0],[1,0]],
  't' : [[0,1],[1,1],[1,0]],
  'u' : [[1,0],[0,0],[1,1]],
  'v' : [[1,0],[1,0],[1,1]],
  'w' : [[0,1],[1,1],[0,1]],
  'x' : [[1,1],[0,0],[1,1]],
  'y' : [[1,1],[0,1],[1,1]],
  'z' : [[1,0],[0,1],[1,1]],
  ' ' : [[0,0],[0,0],[0,0]],
  ',' : [[0,0],[1,0],[0,0]],
  ';' : [[0,0],[1,0],[1,0]],
  ':' : [[0,0],[1,1],[0,0]],
  '.' : [[0,0],[1,1],[0,1]],
  '!' : [[0,0],[1,1],[1,0]],
  '?' : [[0,0],[1,0],[1,1]],
  '*' : [[0,0],[0,1],[1,0]],
  '\'' : [[1,0],[0,0],[0,0]],
  '/' : [[0,1],[0,0],[1,0]],
  '\n' : '\n'
}

const numbers_dict = {
  1 : [[1,0],[0,0],[0,0]],
  2 : [[1,0],[1,0],[0,0]],
  3 : [[1,1],[0,0],[0,0]],
  4 : [[1,1],[0,1],[0,0]],
  5 : [[1,0],[0,1],[0,0]],
  6 : [[1,1],[1,0],[0,0]],
  7 : [[1,1],[1,1],[0,0]],
  8 : [[1,0],[1,1],[0,0]],
  9 : [[0,1],[1,0],[0,0]],
  'special' : [[0,1],[0,1],[1,1]],
  ' ' : [[0,0],[0,0],[0,0]],
  '\n' : '\n'
}

let letters = true;
let numbers = false;

function translate(text) {
  const array_array = [];
  const array_text = Array.from(text.toLowerCase());
  // console.log(array_text);
  for (let i = 0; i < array_text.length; i++) {
    
    const index = array_text[i];
    // console.log(index);

    // if index is text
    if(isNaN(index) || index === '\n' || index === ' '){ 
      if(!letters){ // if letters is off
        array_array.push(letters_dict['special']); // push letter indicator
        letters = true;
        numbers = false;
      }
      array_array.push(letters_dict[index]);

    }else{
      // if index is not a text
      if(!numbers){
        array_array.push(numbers_dict['special']);
        letters = false;
        numbers = true;
      }
      array_array.push(numbers_dict[index]);
    }
  
  }
  return array_array;
}

export default translate;

// The Algorithm for Translating Alphabet Based Text to Grade 2 Braille:
// 1. Split up the text into words by dividing them based on whitespace characters.
//     - Whitespace includes spaces (' ') and new lines ('\n')
// 2. For each word, handle the numbers first.
//     - Numbers in braille use the same symbols as the first 10 letters of the alphabet.
//         - The number '7' and the letter 'g' are both represented by '⠛'.
//         - To differentiate between numbers and letters, an escape code (⠼) is placed before groups of numbers.
//         - Therefore '7' is actually '⠼⠛' whereas 'g' is only '⠛'.
//     - In this step, only the numbers are dealt with, so there will be a mix of both braille and Alphabet symbols.
//         - Example: "123-456-JUNK" becomes "⠼⠁⠃⠉-⠼⠙⠑⠋-JUNK"
// 3. Handle the capitals.
//     - Similarly to numbers in braille, capital letters need an escape code (⠠).
//     - The escape code (⠠) is added to the beginning of each capital letter and the letter is changed to lowercase.
//         - Example 1: "⠼⠁⠃⠉-⠼⠙⠑⠋-JUNK" becomes "⠼⠁⠃⠉-⠼⠙⠑⠋-⠠j⠠u⠠n⠠k". The dashes still remain.
//         - Example 2: "Sweet" becomes "⠠sweet". The non-capital letters remain untouched.
// 4. Trim the word.
//     - Sometimes the words extracted contain punctuation attached to them such as commas or brackets.
//     - Words need to be trimmed so that they can be converted to contractions.
//         - Example: The word "the" is represented by a single braille symbol (⠮).
//         - If the word "the" has punctuation around it ("the!") then it will not be interpreted correctly.
//         - This is also why capitals are converted to lowercase in step 3 because "The" would not work either.
//     - The characters that are trimmed off are called "shavings".
//         - Example: In the word "!where?", the shavings are "!?" and the trimmed word is "where".
// 5. Build the translation.
//     a) Check to see if the trimmed word can be contracted.
//         - This includes common words like "the", "in", "you" etc...
//     b) Translate the remaining characters that are still alphabetic.
//     c) Translate the shavings (this will mostly just be punctuation).
//         - Exceptions to be mindful of:
//             - There is no braille symbol for a generic quote (")
//             - There is only open quotation (“) and closed quotation (”).
//             - Therefore we must keep track of what the last quotation was to convert it correctly.
