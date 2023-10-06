function cleanObj (obj) {  
    const cleanedObject = { ...obj };
    Object.keys(cleanedObject).forEach(
        (key) =>
            (cleanedObject[key] === null || cleanedObject[key] === "") &&
            delete cleanedObject[key]
    );
    return cleanedObject;

};

module.exports = cleanObj;