function deepCopy(obj) {
    if (typeof obj != 'object' || obj == null) {
        return obj;
    }
    var newobj = {};
    for (var attr in obj) {
        newobj[attr] = deepCopy(obj[attr]);
    }
    return newobj;
}

export default deepCopy