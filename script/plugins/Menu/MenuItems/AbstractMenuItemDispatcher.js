class AbstractMenuItemDispatcher {
    static isAvailable(schema) { // eslint-disable-line no-unused-vars
        throw new Error('isAvailable is not implemented!');
    }


    static getMenuItem(schema) { // eslint-disable-line no-unused-vars
        throw new Error('getMenuItem is not implemented!');
    }
}

export default AbstractMenuItemDispatcher;
