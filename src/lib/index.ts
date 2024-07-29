// place files you want to import through the `$lib` alias in this folder.

class Store {
    value: any;
    constructor(value : any) {
        this.value = value;
    };
    get() {
        return this.value;
    };
    set(new_value : typeof this.value) {
        this.value = new_value;
    }
};

export const addressStore = new Store('');