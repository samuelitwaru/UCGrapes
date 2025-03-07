export class StorageService {
    setItem(key: string, value: any): void {
      try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  
    getItem<T>(key: string, defaultValue: T): T {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.error('Error retrieving from localStorage:', error);
        return defaultValue;
      }
    }
  
    removeItem(key: string): void {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing from localStorage:', error);
      }
    }
  }