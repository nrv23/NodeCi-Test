
function is_json(string) {

    try {
        
        return JSON.parse(string);
    } catch (error) {
        return string;
    }
}

module.exports =  { is_json}