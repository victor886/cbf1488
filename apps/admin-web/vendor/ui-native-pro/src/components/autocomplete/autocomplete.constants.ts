// @ts-nocheck
/**
 * Default snap points for the bottom-sheet presentation. A tall fixed snap
 * point keeps the content above the search keyboard (module-level constant
 * so the array reference stays stable across renders).
 */
export const BOTTOM_SHEET_SNAP_POINTS = ['90%'];
/**
 * Default per-presentation delay in milliseconds before focusing the search
 * input after the overlay opens. Gives the presentation time to settle so
 * the focus reliably shows the keyboard on both platforms — the bottom
 * sheet needs longer for its entering animation than the popover and
 * dialog. Overridable per usage via the `autoFocusDelay` prop on
 * `Autocomplete.SearchField`.
 */
export const SEARCH_FIELD_AUTO_FOCUS_DELAY_MAP = {
  'popover': 150,
  'dialog': 150,
  'bottom-sheet': 300,
};
export const DISPLAY_NAME = {
  ROOT: 'HeroUINative.Autocomplete.Root',
  TRIGGER: 'HeroUINative.Autocomplete.Trigger',
  VALUE: 'HeroUINative.Autocomplete.Value',
  TRIGGER_INDICATOR: 'HeroUINative.Autocomplete.TriggerIndicator',
  CLEAR_BUTTON: 'HeroUINative.Autocomplete.ClearButton',
  PORTAL: 'HeroUINative.Autocomplete.Portal',
  OVERLAY: 'HeroUINative.Autocomplete.Overlay',
  CONTENT: 'HeroUINative.Autocomplete.Content',
  CONTENT_BACKGROUND: 'HeroUINative.Autocomplete.ContentBackground',
  SEARCH_FIELD: 'HeroUINative.Autocomplete.SearchField',
  LIST: 'HeroUINative.Autocomplete.List',
  ITEM: 'HeroUINative.Autocomplete.Item',
  ITEM_LABEL: 'HeroUINative.Autocomplete.ItemLabel',
  ITEM_DESCRIPTION: 'HeroUINative.Autocomplete.ItemDescription',
  ITEM_INDICATOR: 'HeroUINative.Autocomplete.ItemIndicator',
  LIST_LABEL: 'HeroUINative.Autocomplete.ListLabel',
  EMPTY: 'HeroUINative.Autocomplete.Empty',
  CLOSE: 'HeroUINative.Autocomplete.Close',
};
