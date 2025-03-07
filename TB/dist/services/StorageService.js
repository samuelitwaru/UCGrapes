export class StorageService {
    setItem(key, value) {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
        }
        catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }
    getItem(key, defaultValue) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        }
        catch (error) {
            console.error('Error retrieving from localStorage:', error);
            return defaultValue;
        }
    }
    removeItem(key) {
        try {
            localStorage.removeItem(key);
        }
        catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    }
}
//# sourceMappingURL=StorageService.js.map