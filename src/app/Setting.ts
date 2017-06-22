export default class Settings {

  update(settings: any, event: any): void {
      settings[event.srcElement.getAttribute("bind")] = event.srcElement.checked;
      if (event) event.stopPropagation();
  }

  toggle(settingsVisible: any, event: Event): void {
      settingsVisible = !settingsVisible;
  }
}
