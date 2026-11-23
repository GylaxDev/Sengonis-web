/* Ephemeral UI state. Nothing here is persisted to localStorage. */

export const ui = {
  view: "home",
  period: 6,
  tab: "fin",
  showArchived: false,
  plantBlock: "all",
  plantStatus: "all",
  inventoryType: "all",
  inventoryStatus: "all",
  query: "",
  reportFrom: "",
  reportTo: "",
  animate: true,
  settingsSection: "profile",
  mapBlock: null,
  palette: null,
};

/* The map keeps its selected block in UI state so the view and controller
   can both read it without importing each other. */
export const mapSelection = {
  get block() {
    return ui.mapBlock;
  },
  set block(value) {
    ui.mapBlock = value;
  },
};
