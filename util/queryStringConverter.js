// we are sending the text as json.Stringigy(jsonobject)

// please verify some time this will return error if 
// if any property contain substring as 'in' like housing: 
function conversionOperator(text) {

    var newtext = text;
    text.replace(/"in"/g, word => {
        let inopreatorIndex = text.indexOf(word);
        let newWord = text.slice(inopreatorIndex + 6, text.indexOf('}', inopreatorIndex) - 1);
        let stringifyArrayOfobject = JSON.stringify(newWord.split(','));
        newtext = text.replace(newWord, stringifyArrayOfobject).replace('"["', '["').replace('"]"', '"]');
        newtext = newtext.replace('in', '$in');
        return word;
    })


    return newtext
}

module.exports = {
    inconversion: conversionOperator
}