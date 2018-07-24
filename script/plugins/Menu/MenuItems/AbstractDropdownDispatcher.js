import Dropdown from '../Dropdown';

class AbstractDropdownDispatcher {
    constructor(itemDispatchers) {
        this.items = itemDispatchers;
    }

    isAvailable(schema) {
        return this.items.some(item => item.isAvailable(schema));
    }

    getMenuItem(schema, dropdownAttributes) {
        if (!this.isAvailable(schema)) {
            throw new Error('None of the items is valid for this Schema!');
        }
        if (!dropdownAttributes) {
            throw new Error('dropdown attributes missing!');
        }
        return new Dropdown(
            this.items.filter(item => item.isAvailable(schema)).map(item => item.getMenuItem(schema)),
            dropdownAttributes,
        );
    }
}

export default AbstractDropdownDispatcher;
