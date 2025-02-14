class Clock {
    constructor(pageId) {
      this.pageId = pageId;
      this.updateTime();
    }
  
    updateTime() {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // Adjust hours for 12-hour format
      const timeString = `${hours}:${minutes} ${ampm}`;
      document.getElementById(this.pageId).textContent = timeString;
    }
}
